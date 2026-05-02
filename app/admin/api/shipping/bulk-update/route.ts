import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { shippingTracking, stickerOrders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { updates, adminId } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: "Invalid updates data" }, { status: 400 });
    }

    let successCount = 0;
    const errors: Array<{ orderId: string; error: string }> = [];

    for (const update of updates) {
      try {
        const { orderId, courier, trackingNumber } = update;

        if (!orderId || !courier || !trackingNumber) {
          errors.push({ orderId: orderId || "unknown", error: "Missing required fields" });
          continue;
        }

        // Check if order exists
        const order = await db.query.stickerOrders.findFirst({
          where: eq(stickerOrders.id, orderId),
        });

        if (!order) {
          errors.push({ orderId, error: "Order not found" });
          continue;
        }

        // Check if tracking already exists
        const existing = await db.query.shippingTracking.findFirst({
          where: eq(shippingTracking.orderId, orderId),
        });

        if (existing) {
          // Update existing tracking
          await db
            .update(shippingTracking)
            .set({
              courier,
              trackingNumber,
              status: "shipped",
              shippedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(shippingTracking.orderId, orderId));
        } else {
          // Create new tracking
          await db.insert(shippingTracking).values({
            id: crypto.randomUUID(),
            app_id: "balikin_id",
            orderId,
            courier,
            trackingNumber,
            status: "shipped",
            shippedAt: new Date(),
          });
        }

        // Update order status
        await db
          .update(stickerOrders)
          .set({ status: "shipped", updatedAt: new Date() })
          .where(eq(stickerOrders.id, orderId));

        successCount++;
      } catch (error) {
        console.error(`Error updating order ${update.orderId}:`, error);
        errors.push({ orderId: update.orderId, error: "Failed to update" });
      }
    }

    // Log the bulk action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "bulk_update_tracking",
      entityType: "shipping_tracking",
      entityId: "bulk",
      originalValue: null,
      newValue: { successCount, errorCount: errors.length },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      successCount,
      errorCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Error bulk updating shipping:", error);
    return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
  }
}

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
    const { orderId, courier, trackingNumber, adminId } = body;

    if (!orderId || !courier || !trackingNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "add_tracking",
      entityType: "shipping_tracking",
      entityId: orderId,
      originalValue: existing || null,
      newValue: { courier, trackingNumber, status: "shipped" },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shipping:", error);
    return NextResponse.json({ error: "Failed to update shipping" }, { status: 500 });
  }
}

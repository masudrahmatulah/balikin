import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { shippingTracking, stickerOrders } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.division, "sticker_orders")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, courier, trackingNumber } = body;

    if (!orderId || !courier || !trackingNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = await db.query.stickerOrders.findFirst({
      where: and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID)),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if tracking already exists
    const existing = await db.query.shippingTracking.findFirst({
      where: and(eq(shippingTracking.orderId, orderId), eq(shippingTracking.app_id, APP_ID)),
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
        .where(and(eq(shippingTracking.orderId, orderId), eq(shippingTracking.app_id, APP_ID)));
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
      .where(and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID)));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
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

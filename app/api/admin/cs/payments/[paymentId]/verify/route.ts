import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { stickerOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyRequest {
  action: "approve" | "reject";
  reason?: string;
  adminId: string;
}

/**
 * Payment Verification API
 * POST /api/admin/cs/payments/[paymentId]/verify
 *
 * Approves or rejects pending payments with Fonnte notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Check admin permission
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await params;
    const body = await request.json();
    const { action, reason, adminId }: VerifyRequest = body;

    // Get payment details
    const payment = await db.query.stickerOrders.findFirst({
      where: eq(stickerOrders.id, paymentId),
      with: {
        user: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.paymentStatus !== "pending") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 });
    }

    // Update payment status
    const newStatus = action === "approve" ? "verified" : "rejected";
    await db
      .update(stickerOrders)
      .set({
        paymentStatus: newStatus,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(stickerOrders.id, paymentId));

    // Send WhatsApp notification via Fonnte
    if (action === "approve") {
      await sendFonnteNotification({
        phone: payment.phone,
        message: `Hi ${payment.recipientName}! Your payment of Rp ${payment.totalAmount.toLocaleString()} has been verified. Your order is now being processed. Thank you!`,
      });
    } else {
      await sendFonnteNotification({
        phone: payment.phone,
        message: `Hi ${payment.recipientName}, your payment was rejected. Reason: ${reason}. Please re-upload your payment proof. Thank you.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: action === "approve"
        ? "Payment approved and customer notified"
        : "Payment rejected and customer notified",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Fonnte notification helper
async function sendFonnteNotification({ phone, message }: { phone: string; message: string }) {
  const fonnteApiUrl = process.env.FONNTE_API_URL || "https://api.fonnte.com/send";
  const fonnteToken = process.env.FONNTE_TOKEN;

  if (!fonnteToken) {
    console.warn("Fonnte token not configured, skipping notification");
    return;
  }

  try {
    await fetch(fonnteApiUrl, {
      method: "POST",
      headers: {
        "Authorization": fonnteToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: phone,
        message: message,
      }),
    });
  } catch (error) {
    console.error("Fonnte notification failed:", error);
  }
}

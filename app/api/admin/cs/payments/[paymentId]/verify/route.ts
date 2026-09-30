import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSessionForAction } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { stickerOrders, tags } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { consumeAcrylicStock } from "@/lib/product-stock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyRequest {
  action: "approve" | "reject";
  reason?: string;
}

const APP_ID = "balikin_id";

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
    const adminSession = await getAdminSessionForAction();
    if (!adminSession || !hasPermission(adminSession.user.division, 'payment_verification')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await params;
    const body = await request.json() as VerifyRequest;
    const action = body.action;
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (action === "reject" && (!reason || reason.length > 500)) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const [payment] = await tx
        .select()
        .from(stickerOrders)
        .where(and(
          eq(stickerOrders.id, paymentId),
          eq(stickerOrders.app_id, APP_ID),
        ))
        .for("update");

      if (!payment) {
        return { kind: "not_found" as const };
      }

      const terminalStatus = action === "approve"
        ? payment.paymentStatus === "paid" || payment.paymentStatus === "verified"
        : payment.paymentStatus === "failed" || payment.paymentStatus === "rejected";
      if (terminalStatus) {
        return { kind: "already_processed" as const };
      }
      if (payment.paymentStatus !== "pending") {
        return { kind: "conflict" as const };
      }

      if (action === "reject") {
        const updated = await tx
          .update(stickerOrders)
          .set({ paymentStatus: "failed", verifiedAt: new Date(), updatedAt: new Date() })
          .where(and(
            eq(stickerOrders.id, paymentId),
            eq(stickerOrders.app_id, APP_ID),
            eq(stickerOrders.paymentStatus, "pending"),
          ))
          .returning({ id: stickerOrders.id });

        if (updated.length === 0) return { kind: "conflict" as const };
        return { kind: "changed" as const, payment, action };
      }

      if (payment.productType === "printable" && !payment.paymentProofUrl) {
        return { kind: "invalid" as const, message: "Payment proof is required" };
      }

      const stockAvailable = payment.productType !== "acrylic"
        ? true
        : await consumeAcrylicStock(
          tx,
          payment.productVariant,
          payment.packQuantity * payment.unitCountPerPack,
        );

      const updated = await tx
        .update(stickerOrders)
        .set({
          paymentStatus: "paid",
          status: payment.productType === "printable"
            ? "completed"
            : payment.productType === "acrylic"
              ? stockAvailable ? "ready_to_ship" : "stock_unavailable"
              : "pending_fulfillment",
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(stickerOrders.id, paymentId),
          eq(stickerOrders.app_id, APP_ID),
          eq(stickerOrders.paymentStatus, "pending"),
        ))
        .returning({ id: stickerOrders.id });

      if (updated.length === 0) return { kind: "conflict" as const };

      if (payment.productType === "printable") {
        let label = "Printable QR Tag";
        try { label = JSON.parse(payment.notes || "{}").label || label; } catch { /* legacy order note */ }
        await tx.insert(tags).values(Array.from({ length: payment.unitCountPerPack }, (_, index) => ({
          app_id: APP_ID,
          slug: nanoid(12),
          ownerId: payment.userId,
          name: `${label} ${index + 1}`,
          contactWhatsapp: payment.phone,
          customMessage: "Scan saya jika menemukan barang ini.",
          status: "normal",
          tier: "premium",
          productType: "printable",
          isVerified: true,
          emailAlertsEnabled: true,
          whatsappAlertsEnabled: true,
          expiresAt: null,
        })));
      }

      return { kind: "changed" as const, payment, action };
    });

    if (result.kind === "not_found") {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    if (result.kind === "conflict") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 409 });
    }
    if (result.kind === "invalid") {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    if (result.kind === "changed") {
      const payment = result.payment;
      await sendFonnteNotification({
        phone: payment.phone,
        message: action === "approve"
          ? `Hi ${payment.recipientName}! Your payment of Rp ${payment.totalAmount.toLocaleString()} has been verified. Your order is now being processed. Thank you!`
          : `Hi ${payment.recipientName}, your payment was rejected. Reason: ${reason}. Please re-upload your payment proof. Thank you.`,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.kind === "already_processed",
      message: result.kind === "already_processed"
        ? "Payment was already processed"
        : action === "approve"
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

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

interface MidtransWebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  order_id: string;
  merchant_id: string;
  masked_card?: string;
  gross_amount: string;
  fraud_status: string;
  currency: string;
  custom_field1?: string;
}

function verifySignature(body: MidtransWebhookPayload, expectedSignature: string): boolean {
  if (!SERVER_KEY) return false;

  // Midtrans signature key: SHA512(order_id+status_code+gross_amount+server_key)
  const signatureInput = `${body.order_id}${body.status_code}${body.gross_amount}${SERVER_KEY}`;
  const hash = crypto.createHash('sha512').update(signatureInput).digest('hex');

  return hash === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as MidtransWebhookPayload;

    // Verify Midtrans signature
    if (!verifySignature(payload, payload.signature_key)) {
      console.error('Invalid Midtrans signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const { order_id, transaction_status, fraud_status } = payload;

    // Determine payment status
    let paymentStatus = 'pending';
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      paymentStatus = 'paid';
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      paymentStatus = 'failed';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'pending';
    }

    // Anti-fraud check
    if (fraud_status === 'challenge') {
      console.warn(`Potential fraud detected for order: ${order_id}`);
      // Optionally handle challenge status
    }

    // Update order payment status
    const result = await db
      .update(stickerOrders)
      .set({
        paymentStatus,
        status: paymentStatus === 'paid' ? 'pending_fulfillment' : 'pending_payment',
        updatedAt: new Date(),
      })
      .where(eq(stickerOrders.id, order_id))
      .returning();

    if (result.length === 0) {
      console.error(`Order not found: ${order_id}`);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`Payment ${transaction_status} for order: ${order_id}`);

    // TODO: Trigger subsequent actions
    // - If paid: generate PIN, enqueue to VDP tool
    // - Send WhatsApp notification to user
    // - Send email receipt

    return NextResponse.json({
      success: true,
      data: { orderId: order_id, paymentStatus },
    });
  } catch (error) {
    console.error('Error processing Midtrans webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

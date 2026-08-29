import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stickerOrders, tagUpgradeOrders, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyKomerceCallback } from '@/lib/komerce-payment';

function resolvePaymentStatus(raw: string): 'pending' | 'paid' | 'failed' {
  const status = raw.toUpperCase();
  if (['PAID', 'SUCCESS', 'SETTLEMENT', 'CAPTURE', 'COMPLETED'].includes(status)) return 'paid';
  if (['PENDING', 'PROCESSING', 'UNPAID', 'WAITING'].includes(status)) return 'pending';
  return 'failed';
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-callback-api-key') || '';

    if (!verifyKomerceCallback(rawBody, signature)) {
      console.error('Invalid Komerce callback signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    const orderId = String(payload.order_id ?? payload.orderId ?? '');
    const paymentStatus = resolvePaymentStatus(
      String(payload.payment_status ?? payload.status ?? payload.transaction_status ?? '')
    );

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id missing' },
        { status: 400 }
      );
    }

    // Tag upgrade (free -> premium) orders use an "upg_" prefixed order_id
    if (orderId.startsWith('upg_')) {
      const upgradeOrderId = orderId.slice('upg_'.length);

      const [upgradeOrder] = await db
        .update(tagUpgradeOrders)
        .set({ paymentStatus, updatedAt: new Date() })
        .where(eq(tagUpgradeOrders.id, upgradeOrderId))
        .returning();

      if (!upgradeOrder) {
        console.error(`Tag upgrade order not found: ${upgradeOrderId}`);
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      if (paymentStatus === 'paid') {
        await db
          .update(tags)
          .set({ tier: 'premium', productType: 'acrylic', expiresAt: null })
          .where(eq(tags.id, upgradeOrder.tagId));
        revalidatePath('/dashboard');
        revalidatePath('/p/[slug]');
        revalidateTag('tags');
      }

      console.log(`Komerce payment ${paymentStatus} for tag upgrade order: ${upgradeOrderId}`);

      return NextResponse.json({
        success: true,
        data: { orderId: upgradeOrderId, paymentStatus },
      });
    }

    // Sticker order payment
    const result = await db
      .update(stickerOrders)
      .set({
        paymentStatus,
        status: paymentStatus === 'paid' ? 'pending_fulfillment' : 'pending_payment',
        updatedAt: new Date(),
      })
      .where(eq(stickerOrders.id, orderId))
      .returning();

    if (result.length === 0) {
      console.error(`Sticker order not found: ${orderId}`);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (paymentStatus === 'paid') {
      revalidatePath('/dashboard');
    }

    console.log(`Komerce payment ${paymentStatus} for order: ${orderId}`);

    return NextResponse.json({
      success: true,
      data: { orderId, paymentStatus },
    });
  } catch (error) {
    console.error('Error processing Komerce webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { buildKomercePaymentResult, createKomercePayment } from '@/lib/komerce-payment';

interface InitiatePaymentInput {
  orderId: string;
}

const APP_ID = 'balikin_id';
const PAYMENT_PROCESSING_STATUS = 'payment_processing';

export async function initiatePayment(input: InitiatePaymentInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  if (!input.orderId) {
    throw new Error('Order ID wajib diisi');
  }

  const orderId = input.orderId.trim();
  const [order] = await db
    .update(stickerOrders)
    .set({ status: PAYMENT_PROCESSING_STATUS, updatedAt: new Date() })
    .where(and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID),
      eq(stickerOrders.userId, session.user.id),
      eq(stickerOrders.status, 'pending_payment'),
      eq(stickerOrders.paymentStatus, 'pending'),
    ))
    .returning();

  if (!order) {
    const existingOrder = await db.query.stickerOrders.findFirst({
      where: and(
        eq(stickerOrders.id, orderId),
        eq(stickerOrders.app_id, APP_ID),
        eq(stickerOrders.userId, session.user.id),
      ),
      columns: { status: true, paymentStatus: true },
    });

    if (!existingOrder) {
      throw new Error('Order tidak ditemukan');
    }
    if (existingOrder.status === PAYMENT_PROCESSING_STATUS) {
      throw new Error('Pembayaran untuk order ini sedang diproses');
    }
    throw new Error('Order tidak berada dalam status pembayaran yang valid');
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`;

  try {
    const data = await createKomercePayment({
      orderId: order.id,
      amount: order.totalAmount,
      customer: {
        name: order.recipientName,
        email: session.user.email || 'user@balikin.app',
        phone: order.phone,
      },
      items: [
        {
          name: `Sticker Pack (${order.unitCountPerPack} units)`,
          quantity: 1,
          price: order.totalAmount,
        },
      ],
      callbackUrl,
    });

    const result = buildKomercePaymentResult(data);

    // No provider identifier is persisted in the current schema. Release the
    // claim only if this request still owns it; a callback may have completed
    // the order while the provider request was in flight.
    await db
      .update(stickerOrders)
      .set({ status: 'pending_payment', updatedAt: new Date() })
      .where(and(
        eq(stickerOrders.id, order.id),
        eq(stickerOrders.app_id, APP_ID),
        eq(stickerOrders.status, PAYMENT_PROCESSING_STATUS),
        eq(stickerOrders.paymentStatus, 'pending'),
      ));

    return {
      success: true,
      orderId: order.id,
      paymentId: result.paymentId,
      paymentUrl: result.paymentUrl,
      qrString: result.qrString,
    };
  } catch (error) {
    await db
      .update(stickerOrders)
      .set({ status: 'pending_payment', updatedAt: new Date() })
      .where(and(
        eq(stickerOrders.id, order.id),
        eq(stickerOrders.app_id, APP_ID),
        eq(stickerOrders.status, PAYMENT_PROCESSING_STATUS),
        eq(stickerOrders.paymentStatus, 'pending'),
      ));
    throw error;
  }
}

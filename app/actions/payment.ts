'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { buildKomercePaymentResult, createKomercePayment } from '@/lib/komerce-payment';

interface InitiatePaymentInput {
  orderId: string;
}

export async function initiatePayment(input: InitiatePaymentInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  if (!input.orderId) {
    throw new Error('Order ID wajib diisi');
  }

  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, input.orderId),
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  if (order.userId !== session.user.id) {
    throw new Error('Order ini bukan milik Anda');
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`;

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

  return {
    success: true,
    orderId: order.id,
    paymentId: result.paymentId,
    paymentUrl: result.paymentUrl,
    qrString: result.qrString,
  };
}
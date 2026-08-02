'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { MIDTRANS_BASE_URL } from '@/lib/constants';

interface InitiatePaymentInput {
  orderId: string;
}

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export async function initiatePayment(input: InitiatePaymentInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY belum dikonfigurasi');
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

  const midtransPayload = {
    transaction_details: {
      order_id: order.id,
      gross_amount: order.totalAmount,
    },
    customer_details: {
      first_name: order.recipientName,
      phone: order.phone,
    },
    item_details: [
      {
        id: 'sticker-pack',
        price: order.totalAmount - order.shippingCost,
        quantity: 1,
        name: `Sticker Pack (${order.unitCountPerPack} units)`,
      },
      {
        id: 'shipping',
        price: order.shippingCost,
        quantity: 1,
        name: `Shipping (${(order.shippingCourier ?? '').toUpperCase()})`,
      },
    ],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${order.id}`,
      error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${order.id}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${order.id}`,
    },
    custom_field1: order.id,
  };

  const authHeader = Buffer.from(`${serverKey}:`).toString('base64');

  const snapResponse = await fetch(`${MIDTRANS_BASE_URL}/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(midtransPayload),
  });

  if (!snapResponse.ok) {
    const errorData = await snapResponse.json().catch(() => null);
    console.error('Midtrans Snap error:', errorData);
    throw new Error('Gagal membuat transaksi pembayaran');
  }

  const snapData = (await snapResponse.json()) as MidtransSnapResponse;

  return {
    success: true,
    token: snapData.token,
    redirectUrl: snapData.redirect_url,
  };
}

'use server';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateStickerOrdersCache } from './data-access';

const APP_ID = 'balikin_id';

async function verifyAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-orders');
  }
  return session;
}

export async function verifyStickerOrder(orderId: string) {
  const session = await verifyAdminSession();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.appId, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  if (order.paymentStatus === 'paid') {
    throw new Error('Order sudah diverifikasi');
  }

  await db
    .update(stickerOrders)
    .set({ paymentStatus: 'paid', verifiedBy: session.user.id })
    .where(eq(stickerOrders.id, orderId));

  await revalidateStickerOrdersCache();
}

export async function updateStickerOrderStatus(
  orderId: string,
  status: 'in_production' | 'shipped' | 'completed'
) {
  const session = await verifyAdminSession();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.appId, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  await db
    .update(stickerOrders)
    .set({ status })
    .where(eq(stickerOrders.id, orderId));

  await revalidateStickerOrdersCache();
}
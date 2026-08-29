'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { tags, tagUpgradeOrders } from '@/db/schema';
import { PREMIUM_UPGRADE_PRICE } from '@/lib/constants';
import { buildKomercePaymentResult, createKomercePayment } from '@/lib/komerce-payment';

export async function initiateTagUpgradePayment(tagId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    throw new Error('Tag tidak ditemukan');
  }

  if (tag.ownerId !== session.user.id) {
    throw new Error('Tag ini bukan milik Anda');
  }

  if (tag.tier === 'premium') {
    throw new Error('Tag ini sudah premium');
  }

  const [order] = await db
    .insert(tagUpgradeOrders)
    .values({
      tagId: tag.id,
      userId: session.user.id,
      amount: PREMIUM_UPGRADE_PRICE,
      paymentStatus: 'pending',
    })
    .returning();

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`;

  const data = await createKomercePayment({
    orderId: `upg_${order.id}`,
    amount: order.amount,
    customer: {
      name: session.user.name || 'Balikin User',
      email: session.user.email || 'user@balikin.app',
      phone: tag.contactWhatsapp || '081234567890',
    },
    items: [
      {
        name: `Upgrade Tag "${tag.name}" ke Premium`,
        quantity: 1,
        price: order.amount,
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

export async function getTagUpgradeOrderStatus(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const order = await db.query.tagUpgradeOrders.findFirst({
    where: eq(tagUpgradeOrders.id, orderId),
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error('Order tidak ditemukan');
  }

  return { paymentStatus: order.paymentStatus };
}
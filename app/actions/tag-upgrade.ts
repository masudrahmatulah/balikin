'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tags, tagUpgradeOrders } from '@/db/schema';
import { PREMIUM_UPGRADE_PRICE } from '@/lib/constants';
import { buildKomercePaymentResult, createKomercePayment } from '@/lib/komerce-payment';

export async function initiateTagUpgradePayment(tagId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { tag, order } = await db.transaction(async (tx) => {
    const [tag] = await tx
      .select()
      .from(tags)
      .where(and(eq(tags.id, tagId), eq(tags.app_id, 'balikin_id')))
      .for('update');

    if (!tag) {
      throw new Error('Tag tidak ditemukan');
    }

    if (tag.ownerId !== session.user.id) {
      throw new Error('Tag ini bukan milik Anda');
    }

    if (tag.tier === 'premium') {
      throw new Error('Tag ini sudah premium');
    }

    const [pendingOrder] = await tx
      .select()
      .from(tagUpgradeOrders)
      .where(and(
        eq(tagUpgradeOrders.tagId, tag.id),
        eq(tagUpgradeOrders.userId, session.user.id),
        eq(tagUpgradeOrders.paymentStatus, 'pending'),
        eq(tagUpgradeOrders.app_id, 'balikin_id'),
      ))
      .limit(1);

    if (pendingOrder) {
      throw new Error('Upgrade order masih menunggu pembayaran');
    }

    const [order] = await tx
      .insert(tagUpgradeOrders)
      .values({
        app_id: 'balikin_id',
        tagId: tag.id,
        userId: session.user.id,
        amount: PREMIUM_UPGRADE_PRICE,
        paymentStatus: 'pending',
      })
      .returning();

    return { tag, order };
  });

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
    where: and(
      eq(tagUpgradeOrders.id, orderId),
      eq(tagUpgradeOrders.app_id, 'balikin_id'),
    ),
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error('Order tidak ditemukan');
  }

  return { paymentStatus: order.paymentStatus };
}

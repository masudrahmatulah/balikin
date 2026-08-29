'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminSessionForAction } from '@/lib/admin';
import { db } from '@/db';
import { stickerOrders, tagUpgradeOrders, tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';

async function requireAdmin() {
  const session = await getAdminSessionForAction();
  if (!session) {
    redirect('/sign-in?redirect=/admin/payments');
  }
  return session;
}

/**
 * Konfirmasi pembayaran upgrade tag secara manual (fallback jika webhook terlewat).
 * Menaikkan tier tag ke premium dengan efek yang sama seperti webhook Komerce.
 */
export async function verifyTagUpgradePayment(orderId: string) {
  const session = await requireAdmin();

  const order = await db.query.tagUpgradeOrders.findFirst({
    where: and(
      eq(tagUpgradeOrders.id, orderId),
      eq(tagUpgradeOrders.app_id, APP_ID)
    ),
    with: {
      tag: {
        columns: { id: true, slug: true, tier: true },
      },
    },
  });

  if (!order) {
    throw new Error('Order upgrade tidak ditemukan');
  }

  if (order.paymentStatus === 'paid') {
    throw new Error('Order sudah berstatus paid');
  }

  if (!order.tag) {
    throw new Error('Tag terkait tidak ditemukan');
  }

  await db.transaction(async (tx) => {
    await tx
      .update(tagUpgradeOrders)
      .set({ paymentStatus: 'paid', updatedAt: new Date() })
      .where(eq(tagUpgradeOrders.id, orderId));

    await tx
      .update(tags)
      .set({ tier: 'premium', productType: 'acrylic', expiresAt: null })
      .where(eq(tags.id, order.tag.id));
  });

  revalidatePath('/admin/payments');
  revalidatePath('/admin/sticker-orders');
  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');
  revalidateTag('tags');

  return { success: true, adminId: session.user.id };
}

/**
 * Tandai pembayaran upgrade tag sebagai gagal/kedaluwarsa (mis. QRIS expired tanpa bayar).
 */
export async function markTagUpgradeFailed(orderId: string) {
  const session = await requireAdmin();

  const order = await db.query.tagUpgradeOrders.findFirst({
    where: and(
      eq(tagUpgradeOrders.id, orderId),
      eq(tagUpgradeOrders.app_id, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order upgrade tidak ditemukan');
  }

  if (order.paymentStatus !== 'pending') {
    throw new Error('Hanya order berstatus pending yang dapat ditandai gagal');
  }

  await db
    .update(tagUpgradeOrders)
    .set({ paymentStatus: 'failed', updatedAt: new Date() })
    .where(eq(tagUpgradeOrders.id, orderId));

  revalidatePath('/admin/payments');

  return { success: true, adminId: session.user.id };
}

/**
 * Konfirmasi pembayaran sticker order secara manual (fallback jika webhook terlewat).
 */
export async function verifyStickerOrderPayment(orderId: string) {
  const session = await requireAdmin();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order sticker tidak ditemukan');
  }

  if (order.paymentStatus === 'paid') {
    throw new Error('Order sudah berstatus paid');
  }

  await db
    .update(stickerOrders)
    .set({
      paymentStatus: 'paid',
      status: 'pending_fulfillment',
      updatedAt: new Date(),
    })
    .where(eq(stickerOrders.id, orderId));

  revalidatePath('/admin/payments');
  revalidatePath('/admin/sticker-orders');
  revalidatePath('/dashboard');

  return { success: true, adminId: session.user.id };
}
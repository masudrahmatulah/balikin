'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getAdminSessionForAction } from '@/lib/admin';
import { hasPermission } from '@/lib/admin-divisions';
import { db } from '@/db';
import { stickerOrders, tagUpgradeOrders, tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { consumeAcrylicStock } from '@/lib/product-stock';

const APP_ID = 'balikin_id';

async function requireAdmin() {
  const session = await getAdminSessionForAction();
  if (!session || !hasPermission(session.user.division, 'payment_verification')) {
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

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(tagUpgradeOrders)
      .where(and(
        eq(tagUpgradeOrders.id, orderId),
        eq(tagUpgradeOrders.app_id, APP_ID),
      ))
      .for('update');

    if (!order) {
      throw new Error('Order upgrade tidak ditemukan');
    }
    if (order.paymentStatus === 'paid') {
      return { alreadyVerified: true };
    }
    if (order.paymentStatus !== 'pending') {
      throw new Error('Order sudah diproses');
    }

    const [tag] = await tx
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.id, order.tagId), eq(tags.app_id, APP_ID)))
      .for('update');

    if (!tag) {
      throw new Error('Tag terkait tidak ditemukan');
    }

    const updatedOrders = await tx
      .update(tagUpgradeOrders)
      .set({ paymentStatus: 'paid', updatedAt: new Date() })
      .where(and(
        eq(tagUpgradeOrders.id, orderId),
        eq(tagUpgradeOrders.app_id, APP_ID),
        eq(tagUpgradeOrders.paymentStatus, 'pending'),
      ))
      .returning({ id: tagUpgradeOrders.id });

    if (updatedOrders.length === 0) {
      throw new Error('Order sudah diproses');
    }

    await tx
      .update(tags)
      .set({ tier: 'premium', productType: 'acrylic', expiresAt: null })
      .where(and(eq(tags.id, tag.id), eq(tags.app_id, APP_ID)));

    return { alreadyVerified: false };
  });

  revalidatePath('/admin/payments');
  revalidatePath('/admin/sticker-orders');
  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');
  if (!result.alreadyVerified) {
    revalidateTag('tags', 'max');
  }

  return { success: true, alreadyVerified: result.alreadyVerified, adminId: session.user.id };
}

/**
 * Tandai pembayaran upgrade tag sebagai gagal/kedaluwarsa (mis. QRIS expired tanpa bayar).
 */
export async function markTagUpgradeFailed(orderId: string) {
  const session = await requireAdmin();

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: tagUpgradeOrders.id, paymentStatus: tagUpgradeOrders.paymentStatus })
      .from(tagUpgradeOrders)
      .where(and(
        eq(tagUpgradeOrders.id, orderId),
        eq(tagUpgradeOrders.app_id, APP_ID),
      ))
      .for('update');

    if (!order) {
      throw new Error('Order upgrade tidak ditemukan');
    }
    if (order.paymentStatus === 'failed') {
      return { alreadyFailed: true };
    }
    if (order.paymentStatus !== 'pending') {
      throw new Error('Hanya order berstatus pending yang dapat ditandai gagal');
    }

    const updatedOrders = await tx
      .update(tagUpgradeOrders)
      .set({ paymentStatus: 'failed', updatedAt: new Date() })
      .where(and(
        eq(tagUpgradeOrders.id, orderId),
        eq(tagUpgradeOrders.app_id, APP_ID),
        eq(tagUpgradeOrders.paymentStatus, 'pending'),
      ))
      .returning({ id: tagUpgradeOrders.id });

    if (updatedOrders.length === 0) {
      throw new Error('Order sudah diproses');
    }
    return { alreadyFailed: false };
  });

  revalidatePath('/admin/payments');

  return { success: true, alreadyFailed: result.alreadyFailed, adminId: session.user.id };
}

/**
 * Konfirmasi pembayaran sticker order secara manual (fallback jika webhook terlewat).
 */
export async function verifyStickerOrderPayment(orderId: string) {
  const session = await requireAdmin();

  const result = await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(stickerOrders)
      .where(and(
        eq(stickerOrders.id, orderId),
        eq(stickerOrders.app_id, APP_ID),
      ))
      .for('update');

    if (!order) {
      throw new Error('Order sticker tidak ditemukan');
    }

    if (order.paymentStatus === 'paid') {
      return { alreadyVerified: true };
    }
    if (order.paymentStatus !== 'pending') {
      throw new Error('Order sudah diproses');
    }

    if (order.productType === 'printable' && !order.paymentProofUrl) {
      throw new Error('Bukti pembayaran printable belum diupload');
    }

    const stockAvailable = order.productType !== 'acrylic'
      ? true
      : await consumeAcrylicStock(tx, order.productVariant, order.packQuantity * order.unitCountPerPack);

    const updatedOrders = await tx.update(stickerOrders).set({
      paymentStatus: 'paid',
      status: order.productType === 'printable'
        ? 'completed'
        : order.productType === 'acrylic'
          ? stockAvailable ? 'ready_to_ship' : 'stock_unavailable'
          : 'pending_fulfillment',
      verifiedAt: new Date(),
      updatedAt: new Date(),
    }).where(and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID),
      eq(stickerOrders.paymentStatus, 'pending'),
    )).returning({ id: stickerOrders.id });

    if (updatedOrders.length === 0) {
      throw new Error('Order sudah diproses');
    }

    if (order.productType === 'printable') {
      let label = 'Printable QR Tag';
      try { label = JSON.parse(order.notes || '{}').label || label; } catch { /* legacy order note */ }
      await tx.insert(tags).values(Array.from({ length: order.unitCountPerPack }, (_, index) => ({
        app_id: APP_ID,
        slug: nanoid(12),
        ownerId: order.userId,
        name: `${label} ${index + 1}`,
        contactWhatsapp: order.phone,
        customMessage: 'Scan saya jika menemukan barang ini.',
        status: 'normal',
        tier: 'premium',
        productType: 'printable',
        isVerified: true,
        emailAlertsEnabled: true,
        whatsappAlertsEnabled: true,
        expiresAt: null,
      })));
    }

    return { alreadyVerified: false };
  });

  if (!result.alreadyVerified) {
    revalidatePath('/admin/payments');
    revalidatePath('/admin/sticker-orders');
    revalidatePath('/dashboard');
  }

  return { success: true, alreadyVerified: result.alreadyVerified, adminId: session.user.id };
}

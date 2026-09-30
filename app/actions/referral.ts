'use server';

import { db } from '@/db';
import { referralVouchers, referralUsages, stickerOrders, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { isAdmin } from '@/lib/admin';

async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}

export async function getMyReferralVoucher() {
  const session = await getSession();
  if (!session?.user) return null;

  const [voucher] = await db
    .select()
    .from(referralVouchers)
    .where(
      and(
        eq(referralVouchers.userId, session.user.id),
        eq(referralVouchers.app_id, 'balikin_id')
      )
    );

  return voucher ?? null;
}

export async function createReferralVoucher() {
  const session = await getSession();
  if (!session?.user) return { success: false, error: 'Tidak terautentikasi.' };

  const code = (session.user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 8) ?? 'USER') + 'BALIKIN';
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  const voucher = await db.transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.id, session.user.id), eq(user.app_id, 'balikin_id')))
      .for('update');

    const [existing] = await tx
      .select()
      .from(referralVouchers)
      .where(and(
        eq(referralVouchers.userId, session.user.id),
        eq(referralVouchers.app_id, 'balikin_id'),
      ))
      .limit(1);

    if (existing) return existing;

    const [created] = await tx
      .insert(referralVouchers)
      .values({
        userId: session.user.id,
        app_id: 'balikin_id',
        code,
        expiresAt,
      })
      .returning();

    return created;
  });

  return { success: true, voucher };
}

export async function claimEWalletReward(voucherId: string, provider: string, walletNumber: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: 'Akses tidak diizinkan.' };

  const [voucher] = await db
    .select()
    .from(referralVouchers)
    .where(
      and(
        eq(referralVouchers.id, voucherId),
        eq(referralVouchers.userId, session.user.id),
        eq(referralVouchers.app_id, 'balikin_id')
      )
    );

  if (!voucher) return { success: false, error: 'Voucher tidak ditemukan.' };

  if (voucher.usageCount < voucher.maxUsageTarget) {
    return { success: false, error: `Target ${voucher.maxUsageTarget} penggunaan belum terpenuhi.` };
  }

  if (voucher.claimStatus !== 'READY_TO_CLAIM') {
    return { success: false, error: 'Hadiah sudah pernah diklaim atau sedang diproses.' };
  }

  const updatedVouchers = await db
    .update(referralVouchers)
    .set({
      claimStatus: 'PENDING_PROCESSING',
      walletProvider: provider,
      walletNumber,
      claimedAt: new Date(),
    })
    .where(and(
      eq(referralVouchers.id, voucherId),
      eq(referralVouchers.userId, session.user.id),
      eq(referralVouchers.claimStatus, 'READY_TO_CLAIM'),
      eq(referralVouchers.app_id, 'balikin_id')
    ))
    .returning({ id: referralVouchers.id });

  if (updatedVouchers.length === 0) {
    return { success: false, error: 'Hadiah sudah pernah diklaim atau sedang diproses.' };
  }

  return { success: true, message: 'Permintaan klaim berhasil dikirim! Saldo akan masuk maks 1×24 jam.' };
}

// Admin-only: confirm reward has been transferred
export async function confirmRewardTransfer(voucherId: string) {
  const session = await getSession();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, error: 'Akses admin diperlukan.' };
  }

  await db
    .update(referralVouchers)
    .set({ claimStatus: 'SUCCESS' })
    .where(
      and(
        eq(referralVouchers.id, voucherId),
        eq(referralVouchers.claimStatus, 'PENDING_PROCESSING'),
        eq(referralVouchers.app_id, 'balikin_id')
      )
    );

  return { success: true };
}

// Admin-only: apply a voucher usage when a purchase completes
export async function applyVoucherUsage(voucherCode: string, buyerUserId: string, orderId?: string) {
  const session = await getSession();
  if (!session?.user?.id || session.user.id !== buyerUserId) {
    return { success: false, error: 'Akses tidak diizinkan.' };
  }

  if (!orderId) {
    return { success: false, error: 'Order pembayaran wajib disertakan.' };
  }

  return db.transaction(async (tx) => {
    const [paidOrder] = await tx
      .select({ id: stickerOrders.id })
      .from(stickerOrders)
      .where(and(
        eq(stickerOrders.id, orderId),
        eq(stickerOrders.userId, buyerUserId),
        eq(stickerOrders.app_id, 'balikin_id'),
        eq(stickerOrders.paymentStatus, 'paid'),
      ))
      .limit(1);

    if (!paidOrder) {
      return { success: false, error: 'Order pembayaran tidak valid.' };
    }

    const [voucher] = await tx
      .select()
      .from(referralVouchers)
      .where(and(
        eq(referralVouchers.code, voucherCode),
        eq(referralVouchers.app_id, 'balikin_id')
      ))
      .for('update');

    if (!voucher) return { success: false, error: 'Kode voucher tidak valid.' };
    if (voucher.expiresAt < new Date()) return { success: false, error: 'Voucher sudah kadaluarsa.' };
    if (voucher.userId === buyerUserId) return { success: false, error: 'Tidak dapat menggunakan voucher sendiri.' };

    const [existingUsage] = await tx
      .select({ id: referralUsages.id })
      .from(referralUsages)
      .where(and(
        eq(referralUsages.voucherId, voucher.id),
        eq(referralUsages.buyerUserId, buyerUserId),
        eq(referralUsages.orderId, orderId),
        eq(referralUsages.app_id, 'balikin_id'),
      ))
      .limit(1);

    if (existingUsage) {
      return { success: true, reachedTarget: voucher.usageCount >= voucher.maxUsageTarget, discount: 10000 };
    }

    await tx.insert(referralUsages).values({
      app_id: 'balikin_id',
      voucherId: voucher.id,
      buyerUserId,
      orderId,
    });

    const newCount = voucher.usageCount + 1;
    const reachedTarget = newCount >= voucher.maxUsageTarget;

    await tx
      .update(referralVouchers)
      .set({
        usageCount: newCount,
        claimStatus: reachedTarget && voucher.claimStatus === 'NOT_ELIGIBLE' ? 'READY_TO_CLAIM' : voucher.claimStatus,
      })
      .where(and(
        eq(referralVouchers.id, voucher.id),
        eq(referralVouchers.app_id, 'balikin_id')
      ));

    return { success: true, reachedTarget, discount: 10000 };
  });
}

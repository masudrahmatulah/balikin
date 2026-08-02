'use server';

import { db } from '@/db';
import { referralVouchers, referralUsages } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';

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

  const existing = await getMyReferralVoucher();
  if (existing) return { success: true, voucher: existing };

  const code = (session.user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 8) ?? 'USER') + 'BALIKIN';
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 15);

  const [voucher] = await db
    .insert(referralVouchers)
    .values({
      userId: session.user.id,
      code,
      expiresAt,
    })
    .returning();

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

  await db
    .update(referralVouchers)
    .set({
      claimStatus: 'PENDING_PROCESSING',
      walletProvider: provider,
      walletNumber,
      claimedAt: new Date(),
    })
    .where(eq(referralVouchers.id, voucherId));

  return { success: true, message: 'Permintaan klaim berhasil dikirim! Saldo akan masuk maks 1×24 jam.' };
}

// Admin-only: confirm reward has been transferred
export async function confirmRewardTransfer(voucherId: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'admin') {
    return { success: false, error: 'Akses admin diperlukan.' };
  }

  await db
    .update(referralVouchers)
    .set({ claimStatus: 'SUCCESS' })
    .where(
      and(
        eq(referralVouchers.id, voucherId),
        eq(referralVouchers.claimStatus, 'PENDING_PROCESSING')
      )
    );

  return { success: true };
}

// Admin-only: apply a voucher usage when a purchase completes
export async function applyVoucherUsage(voucherCode: string, buyerUserId: string, orderId?: string) {
  const [voucher] = await db
    .select()
    .from(referralVouchers)
    .where(
      and(
        eq(referralVouchers.code, voucherCode),
        eq(referralVouchers.app_id, 'balikin_id')
      )
    );

  if (!voucher) return { success: false, error: 'Kode voucher tidak valid.' };
  if (voucher.expiresAt < new Date()) return { success: false, error: 'Voucher sudah kadaluarsa.' };
  if (voucher.userId === buyerUserId) return { success: false, error: 'Tidak dapat menggunakan voucher sendiri.' };

  await db.insert(referralUsages).values({ voucherId: voucher.id, buyerUserId, orderId });

  const newCount = voucher.usageCount + 1;
  const reachedTarget = newCount >= voucher.maxUsageTarget;

  await db
    .update(referralVouchers)
    .set({
      usageCount: newCount,
      claimStatus: reachedTarget && voucher.claimStatus === 'NOT_ELIGIBLE' ? 'READY_TO_CLAIM' : voucher.claimStatus,
    })
    .where(eq(referralVouchers.id, voucher.id));

  return { success: true, reachedTarget, discount: 10000 };
}

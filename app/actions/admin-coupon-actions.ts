'use server';

import { db } from '@/db';
import { coupons } from '@/db/schema';
import { getAdminSessionForAction } from '@/lib/admin';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomBytes } from 'crypto';

async function getAdmin() {
  const session = await getAdminSessionForAction();
  return session?.user ?? null;
}

export async function createCoupons(input: {
  prefix: string;
  count: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  expiresAt?: string;
}) {
  const admin = await getAdmin();
  if (!admin) return { error: 'Anda tidak memiliki akses admin.' };

  const count = Math.min(Math.max(Math.floor(input.count), 1), 100);
  const value = Math.floor(input.discountValue);
  const maxUses = Math.min(Math.max(Math.floor(input.maxUses), 1), 1000000);
  const prefix = input.prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'BALIKIN';

  if (!Number.isFinite(value) || value < 1 || (input.discountType === 'percentage' && value > 100)) {
    return { error: 'Nilai diskon tidak valid.' };
  }

  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) return { error: 'Tanggal kedaluwarsa tidak valid.' };

  const rows = Array.from({ length: count }, () => ({
    code: `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`,
    discountType: input.discountType,
    discountValue: value,
    maxUses,
    expiresAt,
    createdBy: admin.id,
  }));

  try {
    const created = await db.insert(coupons).values(rows).returning({ code: coupons.code });
    revalidatePath('/admin/coupons');
    return { success: true, codes: created.map((coupon) => coupon.code) };
  } catch (error) {
    console.error('Create coupons error:', error);
    return { error: 'Gagal membuat coupon. Silakan coba lagi.' };
  }
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const admin = await getAdmin();
  if (!admin) return { error: 'Anda tidak memiliki akses admin.' };
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function getCoupons() {
  const admin = await getAdmin();
  if (!admin) return [];
  return db.select().from(coupons).orderBy(desc(coupons.createdAt));
}

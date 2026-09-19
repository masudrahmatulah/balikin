'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { otomotifData, pertanianData } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');
}

export async function updateAdminOtomotifData(id: string, formData: FormData) {
  await requireAdmin();
  await db.update(otomotifData).set({
    stnkNumber: String(formData.get('stnkNumber') || ''),
    stnkExpiryDate: formData.get('stnkExpiryDate') ? new Date(String(formData.get('stnkExpiryDate'))) : null,
    oilChangeSchedule: String(formData.get('oilChangeSchedule') || ''),
    serviceHistory: String(formData.get('serviceHistory') || ''),
    insuranceNumber: String(formData.get('insuranceNumber') || ''),
    insuranceProvider: String(formData.get('insuranceProvider') || ''),
    updatedAt: new Date(),
  }).where(eq(otomotifData.id, id));
  revalidatePath('/admin/modules/data');
  revalidatePath('/admin/modules/data/otomotif/' + id);
}

export async function updateAdminPertanianData(id: string, formData: FormData) {
  await requireAdmin();
  await db.update(pertanianData).set({
    hstCalculator: String(formData.get('hstCalculator') || ''),
    fertilizerSchedule: String(formData.get('fertilizerSchedule') || ''),
    harvestLog: String(formData.get('harvestLog') || ''),
    laborCostNotes: String(formData.get('laborCostNotes') || ''),
    updatedAt: new Date(),
  }).where(eq(pertanianData.id, id));
  revalidatePath('/admin/modules/data');
  revalidatePath('/admin/modules/data/pertanian/' + id);
}

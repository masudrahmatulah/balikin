'use server';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { suspensionLog, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';
import { revalidateSuspensionCache } from './data-access';

const APP_ID = 'balikin_id';
const MAX_REASON_LENGTH = 500;
const MAX_IDENTIFIER_LENGTH = 255;

async function verifyAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/suspension-tool');
  }
  return session;
}

export async function createSuspension(input: {
  suspensionType: 'user_id' | 'device_id';
  identifier: string;
  reason: string;
  adminId: string;
}) {
  const session = await verifyAdminSession();
  const { suspensionType, identifier, reason, adminId } = input;

  if (!identifier || identifier.trim().length === 0) {
    throw new Error('Identifier wajib diisi');
  }

  if (identifier.length > MAX_IDENTIFIER_LENGTH) {
    throw new Error('Identifier maksimal 255 karakter');
  }

  if (!reason || reason.trim().length === 0) {
    throw new Error('Alasan wajib diisi');
  }

  if (reason.length > MAX_REASON_LENGTH) {
    throw new Error('Alasan maksimal 500 karakter');
  }

  let userId = null;
  if (suspensionType === 'user_id') {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, identifier),
    });

    if (!existingUser) {
      throw new Error('User tidak ditemukan');
    }

    userId = identifier;
  }

  const [suspension] = await db
    .insert(suspensionLog)
    .values({
      id: crypto.randomUUID(),
      app_id: APP_ID,
      userId,
      suspensionType,
      identifier: identifier.trim(),
      reason: reason.trim(),
      suspendedBy: adminId,
      suspendedAt: new Date(),
      isActive: true,
    })
    .returning();

  const { ip, userAgent } = await getRequestContext();
  await logAuditAction({
    adminId,
    action: 'create_suspension',
    entityType: 'suspension',
    entityId: suspension.id,
    originalValue: null,
    newValue: { suspensionType, reason },
    ipAddress: ip,
    userAgent,
  });

  await revalidateSuspensionCache();
}

export async function liftSuspension(
  suspensionId: string,
  adminId: string,
  liftReason?: string
) {
  const session = await verifyAdminSession();

  const currentSuspension = await db.query.suspensionLog.findFirst({
    where: and(
      eq(suspensionLog.id, suspensionId),
      eq(suspensionLog.app_id, APP_ID)
    ),
  });

  if (!currentSuspension) {
    throw new Error('Suspension tidak ditemukan');
  }

  if (!currentSuspension.isActive) {
    throw new Error('Suspension sudah di-lift');
  }

  await db
    .update(suspensionLog)
    .set({
      isActive: false,
      liftedAt: new Date(),
      liftedBy: adminId,
      liftReason: liftReason?.trim() || null,
    })
    .where(eq(suspensionLog.id, suspensionId));

  const { ip, userAgent } = await getRequestContext();
  await logAuditAction({
    adminId,
    action: 'lift_suspension',
    entityType: 'suspension',
    entityId: suspensionId,
    originalValue: { isActive: true },
    newValue: { isActive: false, liftReason },
    ipAddress: ip,
    userAgent,
  });

  await revalidateSuspensionCache();
}
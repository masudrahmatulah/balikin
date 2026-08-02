'use server';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { stickerSheets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';

const APP_ID = 'balikin_id';

async function verifyAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-sheets');
  }
  return session;
}

/**
 * Reveal a sheet's plain Master PIN on demand. The list page never ships the PIN to the
 * client - this is the only path that returns it, and every reveal is audit-logged so
 * there's a record of which admin looked up which customer's PIN and when.
 */
export async function revealStickerPin(sheetId: string): Promise<{ sheetCode: string; pin: string | null }> {
  const session = await verifyAdminSession();

  const sheet = await db.query.stickerSheets.findFirst({
    where: and(eq(stickerSheets.id, sheetId), eq(stickerSheets.app_id, APP_ID)),
    columns: { sheetCode: true, activationPinPlain: true },
  });

  if (!sheet) {
    throw new Error('Sheet tidak ditemukan');
  }

  const { ip, userAgent } = await getRequestContext();
  await logAuditAction({
    adminId: session.user.id,
    action: 'reveal_master_pin',
    entityType: 'sticker_sheet',
    entityId: sheetId,
    originalValue: null,
    newValue: { sheetCode: sheet.sheetCode },
    ipAddress: ip,
    userAgent,
  });

  return { sheetCode: sheet.sheetCode, pin: sheet.activationPinPlain };
}

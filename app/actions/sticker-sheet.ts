'use server';

import { db } from '@/db';
import { tags, stickerSheets } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { hashValue } from '@/lib/crypto';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Master Activation Key (Lazy Activation) for VDP-stock sticker sheets.
 * See "md for development/sticker_activate.md" for the full scenario spec.
 */

export type StickerSheetScenario =
  | 'ALREADY_OWNED'
  | 'REQUIRE_ACTIVATION'
  | 'DIRECT_LINK'
  | 'FORBIDDEN'
  | 'NOT_FOUND';

export interface StickerSheetClaimContext {
  scenario: StickerSheetScenario;
  sheetCode?: string;
}

function validateItemName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Nama barang wajib diisi');
  }
  if (trimmed.length > 100) {
    throw new Error('Nama barang maksimal 100 karakter');
  }
  return trimmed;
}

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error('Silakan login terlebih dahulu.');
  }
  return session.user.id;
}

/**
 * Determine which claim scenario (A-D from sticker_activate.md) applies for a given tag,
 * used by the claim page to decide whether to show the Master PIN form or bypass it.
 */
export async function getStickerSheetClaimContext(tagId: string): Promise<StickerSheetClaimContext> {
  const userId = await requireUserId();

  const tag = await db.query.tags.findFirst({ where: eq(tags.id, tagId) });
  if (!tag || !tag.sheetId) {
    return { scenario: 'NOT_FOUND' };
  }

  if (tag.ownerId) {
    return { scenario: tag.ownerId === userId ? 'ALREADY_OWNED' : 'FORBIDDEN' };
  }

  const sheet = await db.query.stickerSheets.findFirst({ where: eq(stickerSheets.id, tag.sheetId) });
  if (!sheet) {
    return { scenario: 'NOT_FOUND' };
  }

  if (sheet.status === 'inactive') {
    return { scenario: 'REQUIRE_ACTIVATION', sheetCode: sheet.sheetCode };
  }

  if (sheet.status === 'active' && sheet.ownerId === userId) {
    return { scenario: 'DIRECT_LINK', sheetCode: sheet.sheetCode };
  }

  return { scenario: 'FORBIDDEN', sheetCode: sheet.sheetCode };
}

interface ActivateResult {
  success: boolean;
  error?: string;
}

/**
 * Scenario B: sheet is still inactive. Validate the physical Master PIN, activate the sheet,
 * claim ownership of the sheet, and link the specific scanned tag with its item name.
 * Uses row locking to prevent two people racing to claim the same sheet.
 */
export async function activateStickerSheet(
  tagId: string,
  masterPin: string,
  itemName: string
): Promise<ActivateResult> {
  const userId = await requireUserId();
  const name = validateItemName(itemName);
  const pinHash = hashValue(masterPin.trim().toUpperCase());

  try {
    const result = await db.transaction(async (tx) => {
      const tagRows = await tx.execute(sql`
        SELECT * FROM balikin_tags WHERE id = ${tagId} FOR UPDATE
      `);
      const tagRow = tagRows.rows[0] as any;

      if (!tagRow || !tagRow.sheet_id) {
        return { success: false, error: 'Stiker ini tidak terhubung ke lembaran manapun.' };
      }
      if (tagRow.owner_id) {
        return { success: false, error: 'Stiker ini sudah diklaim.' };
      }

      const sheetRows = await tx.execute(sql`
        SELECT * FROM balikin_sticker_sheets WHERE id = ${tagRow.sheet_id} FOR UPDATE
      `);
      const sheet = sheetRows.rows[0] as any;

      if (!sheet) {
        return { success: false, error: 'Lembaran stiker tidak ditemukan.' };
      }

      if (sheet.status === 'active') {
        if (sheet.owner_id === userId) {
          // Sheet became active between page load and submit (race) - just link this tag.
          await tx.execute(sql`
            UPDATE balikin_tags
            SET owner_id = ${userId}, name = ${name}, claimed_at = NOW(),
                status = 'normal', tier = 'premium', is_verified = true, whatsapp_alerts_enabled = true
            WHERE id = ${tagId}
          `);
          return { success: true };
        }
        return { success: false, error: 'Lembaran ini sudah diaktifkan oleh akun lain.' };
      }

      if (sheet.activation_pin_hash !== pinHash) {
        return { success: false, error: 'Master PIN tidak cocok. Silakan coba lagi.' };
      }

      await tx.execute(sql`
        UPDATE balikin_sticker_sheets
        SET status = 'active', owner_id = ${userId}, claimed_at = NOW()
        WHERE id = ${sheet.id}
      `);

      await tx.execute(sql`
        UPDATE balikin_tags
        SET owner_id = ${userId}, name = ${name}, claimed_at = NOW(),
            status = 'normal', tier = 'premium', is_verified = true, whatsapp_alerts_enabled = true
        WHERE id = ${tagId}
      `);

      return { success: true };
    });

    if (result.success) {
      revalidateTag('tags');
      revalidatePath('/dashboard');
      revalidatePath('/p/[slug]');
    }

    return result;
  } catch (error) {
    console.error('Sticker sheet activation error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
  }
}

/**
 * Scenario C: sheet already active and owned by the scanning user. Bypass the PIN and
 * link this specific tag directly.
 */
export async function claimStickerTagInActiveSheet(tagId: string, itemName: string): Promise<ActivateResult> {
  const userId = await requireUserId();
  const name = validateItemName(itemName);

  const tag = await db.query.tags.findFirst({ where: eq(tags.id, tagId) });
  if (!tag || !tag.sheetId) {
    return { success: false, error: 'Stiker ini tidak terhubung ke lembaran manapun.' };
  }
  if (tag.ownerId) {
    return { success: false, error: 'Stiker ini sudah diklaim.' };
  }

  const sheet = await db.query.stickerSheets.findFirst({ where: eq(stickerSheets.id, tag.sheetId) });
  if (!sheet || sheet.status !== 'active' || sheet.ownerId !== userId) {
    return { success: false, error: 'Lembaran ini belum aktif untuk akun Anda.' };
  }

  await db.update(tags)
    .set({
      ownerId: userId,
      name,
      claimedAt: new Date(),
      status: 'normal',
      tier: 'premium',
      isVerified: true,
      whatsappAlertsEnabled: true,
    })
    .where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');
  revalidateTag('tags');

  return { success: true };
}

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

export interface ClaimCodeLookupResult {
  success: boolean;
  error?: string;
  sheet?: {
    sheetCode: string;
    masterPin: string;
    tags: Array<{ serialNumber: string; slug: string }>;
  };
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

/** Return a paid user's Master PIN only for a sheet attached to their order. */
export async function getClaimCodesForOrder(
  orderId: string,
  sheetCode: string
): Promise<ClaimCodeLookupResult> {
  const userId = await requireUserId();
  const normalizedOrderId = orderId.trim();
  const normalizedSheetCode = sheetCode.trim().toUpperCase();

  if (!normalizedOrderId || !normalizedSheetCode || normalizedSheetCode.length > 100) {
    return { success: false, error: 'Kode sheet tidak valid.' };
  }

  const rows = await db.execute(sql`
    SELECT
      s.sheet_code,
      s.activation_pin_plain,
      t.serial_number,
      t.slug
    FROM balikin_sticker_sheets s
    INNER JOIN balikin_tags t
      ON t.sheet_id = s.id
      AND t.app_id = 'balikin_id'
    INNER JOIN balikin_tag_bundles b
      ON b.id = t.bundle_id
      AND b.app_id = 'balikin_id'
    INNER JOIN balikin_sticker_orders o
      ON o.id = b.order_id
      AND o.app_id = 'balikin_id'
    WHERE s.app_id = 'balikin_id'
      AND s.sheet_code = ${normalizedSheetCode}
      AND o.id = ${normalizedOrderId}
      AND o.user_id = ${userId}
      AND o.payment_status = 'paid'
    ORDER BY t.serial_number ASC
  `);

  const resultRows = rows.rows as Array<{
    sheet_code: string;
    activation_pin_plain: string | null;
    serial_number: string | null;
    slug: string;
  }>;

  if (resultRows.length === 0) {
    return {
      success: false,
      error: 'Kode sheet tidak ditemukan pada order Anda yang sudah dibayar.',
    };
  }

  const masterPin = resultRows[0].activation_pin_plain;
  if (!masterPin) {
    return { success: false, error: 'Kode klaim belum tersedia. Hubungi CS Balikin.' };
  }

  return {
    success: true,
    sheet: {
      sheetCode: resultRows[0].sheet_code,
      masterPin,
      tags: resultRows
        .filter((row) => row.serial_number)
        .map((row) => ({ serialNumber: row.serial_number as string, slug: row.slug })),
    },
  };
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

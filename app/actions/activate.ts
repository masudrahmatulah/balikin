"use server";

import { db } from "@/db";
import { tags, user } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { hashValue } from "@/lib/crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { clearActivationSession, setBatchActivationSession } from "@/lib/activation-cookie";
import { checkRateLimitByType } from '@/lib/rate-limit';
import { redirect } from 'next/navigation';

interface ActivateResult {
  success: boolean;
  error?: string;
  serialNumber?: string;
  tagId?: string;
  userName?: string;
}

/**
 * Process activation request using QR token or manual PIN fallback.
 * Validates against SHA-256 hashed values in database (PRD v2 security requirement).
 * Uses database transaction with row locking to prevent race conditions (Grill Guard 2.2).
 * Clears activation cookie after successful claim (Grill Guard 2.1).
 */
export async function processActivation(
  data: { slug: string; tokenOrPin: string }
): Promise<ActivateResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  const userId = session.user.id;
  const hashInput = hashValue(data.tokenOrPin.trim().toUpperCase());

  try {
    // Transaksi + row lock (SELECT FOR UPDATE) cegah klaim ganda (Grill Guard 2.2)
    // Query memakai parameter binding Drizzle — tanpa interpolasi string (anti SQL injection)
    const result = await db.transaction(async (tx) => {
      const [tagData] = await tx
        .select()
        .from(tags)
        .where(and(eq(tags.slug, data.slug), eq(tags.status, "unclaimed")))
        .for("update");

      if (!tagData) {
        return { success: false, error: "Aset tidak ditemukan atau sudah diaktifkan." };
      }

      // Verify hash matches either token OR PIN (both use same SHA-256 hashing)
      const isValid =
        tagData.activationTokenHash === hashInput ||
        tagData.activationPinHash === hashInput;

      if (!isValid) {
        return { success: false, error: "Kode Aktivasi atau PIN tidak cocok. Silakan coba lagi." };
      }

      // Update ownership with claimed_at timestamp
      await tx
        .update(tags)
        .set({
          ownerId: userId,
          status: "claimed",
          claimedAt: new Date(),
        })
        .where(eq(tags.id, tagData.id));

      return {
        success: true,
        serialNumber: tagData.serialNumber ?? undefined,
        tagId: tagData.id,
      };
    });

    // Clear activation cookie after successful claim (Grill Guard 2.1)
    if (result.success) {
      await clearActivationSession();
    }

    // Get user name for success message
    const owner = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { name: true },
    });

    return { ...result, userName: owner?.name || undefined };
  } catch (error) {
    console.error("Activation error:", error);
    return { success: false, error: "Terjadi kesalahan sistem. Silakan coba lagi." };
  }
}

export async function beginBatchActivation(batchId: string, claimCode: string): Promise<never> {
  if (!/^[0-9a-f-]{36}$/i.test(batchId)) redirect('/');
  const normalizedCode = normalizeClaimCode(claimCode);
  await setBatchActivationSession(batchId, normalizedCode);
  redirect(`/sign-in?redirect=${encodeURIComponent(`/activate/batch/${batchId}`)}`);
}

function normalizeClaimCode(value: string): string {
  const characters = value.trim().toUpperCase().replace(/-/g, '');
  return characters.length === 8
    ? `${characters.slice(0, 4)}-${characters.slice(4)}`
    : value.trim().toUpperCase();
}

export async function processBatchActivation(
  batchId: string,
  claimCode: string,
): Promise<ActivateResult & { claimedCount?: number }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: 'Silakan login terlebih dahulu.' };
  if (!/^[0-9a-f-]{36}$/i.test(batchId)) {
    return { success: false, error: 'Batch atau kode klaim tidak valid.' };
  }

  const normalizedCode = normalizeClaimCode(claimCode);
  if (!/^[0-9A-HJ-NP-Z]{4}-?[0-9A-HJ-NP-Z]{4}$/.test(normalizedCode)) {
    return { success: false, error: 'Kode klaim tidak cocok. Periksa kode pada buku petunjuk produk.' };
  }
  const rateLimit = await checkRateLimitByType(`batch-claim:${session.user.id}`, 'auth');
  if (!rateLimit.allowed) {
    return { success: false, error: 'Terlalu banyak percobaan. Coba kembali satu menit lagi.' };
  }

  const pinHash = hashValue(normalizedCode);
  try {
    const result = await db.transaction(async (tx) => {
      const matchingSheets = await tx.execute(sql`
        SELECT id, status, owner_id, sheet_code
        FROM balikin_sticker_sheets
        WHERE batch_id = ${batchId}
          AND app_id = 'balikin_id'
          AND activation_pin_hash = ${pinHash}
        FOR UPDATE
      `);
      const sheet = matchingSheets[0] as { id: string; status: string; owner_id: string | null; sheet_code: string } | undefined;

      if (sheet) {
        if (sheet.owner_id) {
          return sheet.owner_id === session.user.id
            ? { success: false, error: 'Paket ini sudah diklaim oleh akun Anda.' }
            : { success: false, error: 'Kode klaim tidak cocok atau paket sudah diklaim.' };
        }

        const packageTags = await tx.execute(sql`
          SELECT id, owner_id
          FROM balikin_tags
          WHERE sheet_id = ${sheet.id} AND app_id = 'balikin_id'
          FOR UPDATE
        `);
        if (packageTags.some((tag) => (tag as { owner_id: string | null }).owner_id !== null)) {
          return { success: false, error: 'Sebagian tag dalam paket sudah diklaim. Hubungi layanan pelanggan.' };
        }

        const claimedTags = await tx.execute(sql`
          UPDATE balikin_tags
          SET owner_id = ${session.user.id}, claimed_at = NOW(), status = 'normal',
              tier = 'premium', is_verified = TRUE, whatsapp_alerts_enabled = TRUE
          WHERE sheet_id = ${sheet.id}
            AND app_id = 'balikin_id'
            AND owner_id IS NULL
          RETURNING id, serial_number
        `);
        if (claimedTags.length === 0) {
          return { success: false, error: 'Paket ini tidak memiliki tag yang bisa diklaim.' };
        }

        await tx.execute(sql`
          UPDATE balikin_sticker_sheets
          SET status = 'active', owner_id = ${session.user.id}, claimed_at = NOW()
          WHERE id = ${sheet.id}
        `);
        return {
          success: true,
          serialNumber: sheet.sheet_code,
          claimedCount: claimedTags.length,
        };
      }

      const matchingTags = await tx.execute(sql`
        SELECT id, serial_number, owner_id
        FROM balikin_tags
        WHERE batch_id = ${batchId}
          AND app_id = 'balikin_id'
          AND activation_pin_hash = ${pinHash}
        FOR UPDATE
      `);
      const tag = matchingTags[0] as { id: string; serial_number: string | null; owner_id: string | null } | undefined;
      if (!tag) return { success: false, error: 'Kode klaim tidak cocok. Periksa kode pada buku petunjuk produk.' };
      if (tag.owner_id) {
        return tag.owner_id === session.user.id
          ? { success: false, error: 'Tag ini sudah diklaim oleh akun Anda.' }
          : { success: false, error: 'Kode klaim tidak cocok atau tag sudah diklaim.' };
      }

      await tx.execute(sql`
        UPDATE balikin_tags
        SET owner_id = ${session.user.id}, claimed_at = NOW()
        WHERE id = ${tag.id} AND owner_id IS NULL
      `);
      return { success: true, serialNumber: tag.serial_number || undefined, claimedCount: 1 };
    });

    if (result.success) await clearActivationSession();
    return result;
  } catch (error) {
    console.error('Batch activation error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem. Silakan coba lagi.' };
  }
}

/**
 * Check if a slug exists and is unclaimed (for validation before showing activation form).
 */
export async function checkTagAvailability(slug: string): Promise<{
  available: boolean;
  requiresActivation: boolean;
}> {
  try {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, slug),
    });

    if (!tag) {
      return { available: false, requiresActivation: false };
    }

    const requiresActivation = !!(tag.activationTokenHash && tag.activationPinHash);

    return {
      available: tag.status === "unclaimed" && tag.ownerId === null,
      requiresActivation,
    };
  } catch {
    return { available: false, requiresActivation: false };
  }
}

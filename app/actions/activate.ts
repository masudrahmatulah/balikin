"use server";

import { db } from "@/db";
import { tags, user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { hashValue } from "@/lib/crypto";
import { auth } from "@/lib/auth";
import { clearActivationSession } from "@/lib/activation-cookie";

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
    headers: new Headers({ cookie: "" }),
  });

  if (!session) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  const userId = session.user.id;
  const hashInput = hashValue(data.tokenOrPin.trim().toUpperCase());

  try {
    // Use transaction with row locking (SELECT FOR UPDATE) to prevent race conditions (Grill Guard 2.2)
    const result = await db.transaction(async (tx) => {
      // Find tag with row lock - prevents concurrent claims
      const tag = await tx.execute(`
        SELECT * FROM balikin_tags
        WHERE slug = '${data.slug}' AND status = 'unclaimed'
        FOR UPDATE
      `);

      if (!tag || tag.rows.length === 0) {
        return { success: false, error: "Aset tidak ditemukan atau sudah diaktifkan." };
      }

      const tagData = tag.rows[0] as any;

      // Verify hash matches either token OR PIN (both use same SHA-256 hashing)
      const isValid =
        tagData.activation_token_hash === hashInput ||
        tagData.activation_pin_hash === hashInput;

      if (!isValid) {
        return { success: false, error: "Kode Aktivasi atau PIN tidak cocok. Silakan coba lagi." };
      }

      // Update ownership with claimed_at timestamp
      await tx.execute(`
        UPDATE balikin_tags
        SET owner_id = '${userId}',
            status = 'claimed',
            claimed_at = NOW()
        WHERE id = '${tagData.id}'
      `);

      return {
        success: true,
        serialNumber: tagData.serial_number,
        tagId: tagData.id,
      };
    });

    // Clear activation cookie after successful claim (Grill Guard 2.1)
    if (result.success) {
      await clearActivationSession();
    }

    // Get user name for success message
    const user = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { name: true },
    });

    return { ...result, userName: user?.name || undefined };
  } catch (error) {
    console.error("Activation error:", error);
    return { success: false, error: "Terjadi kesalahan sistem. Silakan coba lagi." };
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

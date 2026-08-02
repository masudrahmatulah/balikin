"use server";

import { db } from "@/db";
import { printBatches, tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { generateBatchReprint } from "@/lib/vdp-engine";

interface ReprintResult {
  success: boolean;
  error?: string;
  stream?: ReadableStream;
  batchNumber?: string;
  totalStickers?: number;
}

/**
 * Generate PDF for reprinting an existing batch
 * Grill Guard 1.2: Uses existing data without regenerating tokens
 *
 * This allows vendors to reprint damaged/lost A3/A4 sheets without
 * creating new activation codes, maintaining data integrity.
 */
export async function generateBatchPdf(
  batchId: string,
  paperSize: 'a3' | 'a4' = 'a3'
): Promise<ReprintResult> {
  // Verify admin access
  const admin = await isAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized: Admin access required" };
  }

  try {
    // Fetch batch data with all related tags
    const batch = await db.query.printBatches.findFirst({
      where: eq(printBatches.id, batchId),
      columns: {
        id: true,
        batchNumber: true,
        totalStickers: true,
        status: true,
        serialNumberRange: true,
      },
    });

    if (!batch) {
      return { success: false, error: "Batch tidak ditemukan" };
    }

    // Fetch all tags for this batch with activation data
    const batchTags = await db.query.tags.findMany({
      where: eq(tags.batchId, batchId),
      columns: {
        id: true,
        slug: true,
        serialNumber: true,
        activationPinPlain: true,
        activationToken: true,
        isCustom: true,
        name: true,
        activationTokenHash: true,
      },
      orderBy: (tags, { asc }) => [asc(tags.slug)],
    });

    if (batchTags.length === 0) {
      return { success: false, error: "Batch tidak memiliki tag" };
    }

    // Verify all tags have activation data (security check)
    const tagsWithoutActivation = batchTags.filter(
      (tag) => !tag.activationTokenHash || !tag.activationPinPlain
    );

    if (tagsWithoutActivation.length > 0) {
      return {
        success: false,
        error: `${tagsWithoutActivation.length} tag tidak memiliki data aktivasi. Tidak dapat melakukan reprint aman.`
      };
    }

    // Generate PDF using existing data (no token regeneration)
    const stream = await generateBatchReprint(batchId, db, paperSize);

    return {
      success: true,
      stream,
      batchNumber: batch.batchNumber,
      totalStickers: batch.totalStickers,
    };
  } catch (error) {
    console.error("Batch reprint error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat generate PDF"
    };
  }
}

/**
 * List available batches for reprint
 */
export async function listReprintableBatches(): Promise<{
  success: boolean;
  error?: string;
  batches?: Array<{
    id: string;
    batchNumber: string;
    totalStickers: number;
    status: string;
    serialNumberRange?: string;
    createdAt: Date;
  }>;
}> {
  const admin = await isAdmin();
  if (!admin) {
    return { success: false, error: "Unauthorized: Admin access required" };
  }

  try {
    const batches = await db.query.printBatches.findMany({
      columns: {
        id: true,
        batchNumber: true,
        totalStickers: true,
        status: true,
        serialNumberRange: true,
        createdAt: true,
      },
      orderBy: (printBatches, { desc }) => [desc(printBatches.createdAt)],
      limit: 50,
    });

    // Only include batches that are completed or ready
    const reprintableBatches = batches.filter(
      (batch) => batch.status === 'completed' || batch.status === 'ready'
    );

    return {
      success: true,
      batches: reprintableBatches.map((batch) => ({
        ...batch,
        createdAt: new Date(batch.createdAt),
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil daftar batch"
    };
  }
}

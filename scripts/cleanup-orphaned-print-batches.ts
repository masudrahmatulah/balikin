/**
 * One-time cleanup: remove orphaned print_batches and print_queue entries
 * that no longer have any tags referencing them (e.g. after a bulk tag delete).
 *
 * Run with: npx tsx scripts/cleanup-orphaned-print-batches.ts
 */

import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  const { db } = await import('@/db');
  const { printBatches, printQueue, tags, stickerSheets } = await import('@/db/schema');
  const { count, inArray } = await import('drizzle-orm');

  console.log('🧹 Cleaning up orphaned print batches, print queue & sticker sheets...\n');

  // 1. All print queue entries and their batch ids
  const queueRows = await db.select({ batchId: printQueue.batchId }).from(printQueue);
  const queueBatchIds = Array.from(new Set(queueRows.map((r) => r.batchId)));

  // 2. All print batches
  const batchRows = await db.select({ id: printBatches.id }).from(printBatches);
  const batchIds = batchRows.map((r) => r.id);
  console.log(`📦 Print batches: ${batchIds.length}`);
  console.log(`🖨️  Print queue entries: ${queueRows.length}`);

  // 3. Batches that still have tags referencing them (keep these)
  const keptRows = batchIds.length
    ? await db
        .select({ id: tags.batchId })
        .from(tags)
        .where(inArray(tags.batchId, batchIds))
        .groupBy(tags.batchId)
    : [];
  const keptSet = new Set(keptRows.map((r) => r.id));

  const orphanedBatchIds = batchIds.filter((id) => !keptSet.has(id));
  console.log(`🗑️  Orphaned print batches to delete: ${orphanedBatchIds.length}`);

  // 4. Print queue rows to delete: batchId orphaned, or batchId without a batch record
  const validBatchSet = new Set(batchIds);
  const queueToDelete = queueRows
    .filter((r) => !validBatchSet.has(r.batchId) || orphanedBatchIds.includes(r.batchId))
    .map((r) => r.batchId);
  console.log(`🗑️  Orphaned print queue entries to delete: ${queueToDelete.length}`);

  // 5. Sticker sheets to delete: batch is orphaned/missing AND no tags reference the sheet.
  //    (Sheets belonging to a still-existing batch, or still referenced by a tag, are kept.)
  const sheetRows = await db.select({ id: stickerSheets.id, batchId: stickerSheets.batchId }).from(stickerSheets);
  const referencedSheetRows = sheetRows.length
    ? await db
        .select({ id: tags.sheetId })
        .from(tags)
        .where(inArray(tags.sheetId, sheetRows.map((s) => s.id)))
        .groupBy(tags.sheetId)
    : [];
  const referencedSheetSet = new Set(referencedSheetRows.map((r) => r.id));
  const orphanedSheetIds = sheetRows
    .filter((s) => !referencedSheetSet.has(s.id))
    .filter((s) => !s.batchId || orphanedBatchIds.includes(s.batchId))
    .map((s) => s.id);
  console.log(`🗑️  Orphaned sticker sheets to delete: ${orphanedSheetIds.length}`);

  if (queueToDelete.length === 0 && orphanedBatchIds.length === 0 && orphanedSheetIds.length === 0) {
    console.log('\n✅ Nothing to clean up.');
    return;
  }

  if (queueToDelete.length) {
    await db.delete(printQueue).where(inArray(printQueue.batchId, queueToDelete));
  }
  if (orphanedBatchIds.length) {
    await db.delete(printBatches).where(inArray(printBatches.id, orphanedBatchIds));
  }
  if (orphanedSheetIds.length) {
    await db.delete(stickerSheets).where(inArray(stickerSheets.id, orphanedSheetIds));
  }

  const remainingQueue = await db.select({ count: count() }).from(printQueue);
  const remainingBatches = await db.select({ count: count() }).from(printBatches);
  const remainingSheets = await db.select({ count: count() }).from(stickerSheets);
  console.log(`\n✅ Done. Remaining print queue: ${remainingQueue[0]?.count ?? 0}, batches: ${remainingBatches[0]?.count ?? 0}, sticker sheets: ${remainingSheets[0]?.count ?? 0}`);
}

main()
  .catch((err) => {
    console.error('❌ Cleanup failed:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
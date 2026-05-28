'use server';

import { cache } from 'react';
import { db } from '@/db';
import { tags, tagBundles, printQueue } from '@/db/schema';
import { desc, eq, sql, and, isNull, or } from 'drizzle-orm';

const APP_ID = 'balikin_id';

async function getVDPTagStatsCore() {

  const [totalResult, unassignedResult, batchResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(tags)
      .where(eq(tags.appId, APP_ID)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tags)
      .where(
        and(
          eq(tags.appId, APP_ID),
          isNull(tags.ownerId)
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(tagBundles)
      .where(eq(tagBundles.appId, APP_ID)),
  ]);

  return {
    totalTags: totalResult[0]?.count ?? 0,
    unassignedTags: unassignedResult[0]?.count ?? 0,
    totalBundles: batchResult[0]?.count ?? 0,
  };
}

export const getVDPTagStats = cache(getVDPTagStatsCore);

async function getVDPPrintQueueStatsCore() {

  const [pendingResult, printingResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(printQueue)
      .where(
        and(
          eq(printQueue.appId, APP_ID),
          eq(printQueue.status, 'pending')
        )
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(printQueue)
      .where(
        and(
          eq(printQueue.appId, APP_ID),
          eq(printQueue.status, 'printing')
        )
      ),
  ]);

  return {
    pending: pendingResult[0]?.count ?? 0,
    printing: printingResult[0]?.count ?? 0,
  };
}

export const getVDPPrintQueueStats = cache(getVDPPrintQueueStatsCore);

async function getVDPRecentBatchesCore(limit: number = 5) {

  const batches = await db.query.tagBundles.findMany({
    where: eq(tagBundles.appId, APP_ID),
    orderBy: [desc(tagBundles.createdAt)],
    with: {
      tags: {
        columns: { id: true },
      },
    },
    limit,
  });

  return bundles;
}

export const getVDPRecentBatches = cache(getVDPRecentBatchesCore.bind(null, 5));

export async function revalidateVDPCache() {
}
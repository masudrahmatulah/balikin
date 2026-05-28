'use server';

import { cache } from 'react';
import { db } from '@/db';
import { printQueue } from '@/db/schema';
import { desc, eq, sql, inArray, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';
const ITEMS_PER_PAGE = 25;

async function getPrintQueueItemsCore(page: number = 1, status?: string) {

  const offset = (page - 1) * ITEMS_PER_PAGE;

  const items = await db.query.printQueue.findMany({
    where: status
      ? and(eq(printQueue.status, status), eq(printQueue.appId, APP_ID))
      : eq(printQueue.appId, APP_ID),
    orderBy: [desc(printQueue.createdAt)],
    with: {
      printedByUser: true,
      materialInventory: true,
    },
    limit: ITEMS_PER_PAGE,
    offset,
  });

  return items;
}

export const getPrintQueueItems = cache(getPrintQueueItemsCore);

async function getPrintQueueItemsCountCore(status?: string) {

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(printQueue)
    .where(
      status
        ? and(eq(printQueue.status, status), eq(printQueue.appId, APP_ID))
        : eq(printQueue.appId, APP_ID)
    );

  return count;
}

export const getPrintQueueItemsCount = cache(getPrintQueueItemsCountCore);

async function getPrintQueueStatsCore() {

  const stats = await db
    .select({
      status: printQueue.status,
      count: sql<number>`count(*)`,
    })
    .from(printQueue)
    .where(eq(printQueue.appId, APP_ID))
    .groupBy(printQueue.status);

  return stats.reduce((acc, { status, count }) => {
    acc[status as string] = count;
    return acc;
  }, {} as Record<string, number>);
}

export const getPrintQueueStats = cache(getPrintQueueStatsCore);

async function getPrintQueueItemById(id: string) {
  const item = await db.query.printQueue.findFirst({
    where: and(eq(printQueue.id, id), eq(printQueue.appId, APP_ID)),
    with: {
      printedByUser: true,
      materialInventory: true,
    },
  });

  return item;
}

export async function revalidatePrintQueueCache() {
}
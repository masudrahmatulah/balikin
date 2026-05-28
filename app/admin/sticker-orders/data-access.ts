'use server';

import { cache } from 'react';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';
const ORDERS_PER_PAGE = 20;

async function getStickerOrdersCore(page: number = 1) {

  const offset = (page - 1) * ORDERS_PER_PAGE;

  const orders = await db.query.stickerOrders.findMany({
    where: eq(stickerOrders.app_id, APP_ID),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: true,
      bundles: {
        with: {
          tags: {
            columns: { id: true },
          },
        },
      },
    },
    limit: ORDERS_PER_PAGE,
    offset,
  });

  return orders;
}

export const getStickerOrders = cache(getStickerOrdersCore);

async function getStickerOrdersCountCore() {

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stickerOrders)
    .where(eq(stickerOrders.app_id, APP_ID));

  return count;
}

export const getStickerOrdersCount = cache(getStickerOrdersCountCore);

async function getStickerOrderById(id: string) {
  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, id),
      eq(stickerOrders.app_id, APP_ID)
    ),
    with: {
      user: true,
      bundles: {
        with: {
          tags: true,
        },
      },
    },
  });

  return order;
}

async function getPendingOrdersCountCore() {

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stickerOrders)
    .where(
      and(
        eq(stickerOrders.app_id, APP_ID),
        eq(stickerOrders.paymentStatus, 'pending')
      )
    );

  return count;
}

export const getPendingOrdersCount = cache(getPendingOrdersCountCore);

export async function revalidateStickerOrdersCache() {
}
'use server';

import { cache } from 'react';
import { db } from '@/db';
import { stickerOrders, moduleRequests, user } from '@/db/schema';
import { desc, count, eq, and, sql } from 'drizzle-orm';

const APP_ID = 'balikin_id';

async function getCSPendingPaymentsCountCore() {

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(stickerOrders)
    .where(
      and(
        eq(stickerOrders.appId, APP_ID),
        eq(stickerOrders.paymentStatus, 'pending')
      )
    );

  return count;
}

export const getCSPendingPaymentsCount = cache(getCSPendingPaymentsCountCore);

async function getCSRecentOrdersCore() {

  const orders = await db.query.stickerOrders.findMany({
    where: and(
      eq(stickerOrders.appId, APP_ID),
      eq(stickerOrders.paymentStatus, 'pending')
    ),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: true,
    },
    limit: 5,
  });

  return orders;
}

export const getCSRecentOrders = cache(getCSRecentOrdersCore);

async function getCSModuleRequestsSummaryCore() {

  const [totalResult, pendingResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(moduleRequests)
      .where(eq(moduleRequests.appId, APP_ID)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(moduleRequests)
      .where(
        and(eq(moduleRequests.appId, APP_ID), eq(moduleRequests.status, 'pending'))
      ),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    pending: pendingResult[0]?.count ?? 0,
  };
}

export const getCSModuleRequestsSummary = cache(getCSModuleRequestsSummaryCore);

async function getCSRecentModuleRequestsCore() {

  const requests = await db.query.moduleRequests.findMany({
    where: eq(moduleRequests.appId, APP_ID),
    orderBy: [desc(moduleRequests.createdAt)],
    with: {
      user: true,
    },
    limit: 5,
  });

  return requests;
}

export const getCSRecentModuleRequests = cache(getCSRecentModuleRequestsCore);

async function getCSDashboardCore() {

  const [pendingPaymentsCount, recentOrders, moduleRequestsSummary, recentRequests] = await Promise.all([
    getCSPendingPaymentsCount(),
    getCSRecentOrders(),
    getCSModuleRequestsSummary(),
    getCSRecentModuleRequests(),
  ]);

  return {
    pendingPaymentsCount,
    recentOrders,
    moduleRequestsSummary,
    recentRequests,
  };
}

export const getCSDashboard = cache(getCSDashboardCore);

export async function revalidateCSDashboardCache() {
}
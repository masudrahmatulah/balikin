'use server';

import { cache } from 'react';
import { db } from '@/db';
import { suspensionLog } from '@/db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';
const SUSPENSIONS_PER_PAGE = 25;

async function getSuspensionsCore(page: number = 1) {

  const offset = (page - 1) * SUSPENSIONS_PER_PAGE;

  const suspensions = await db.query.suspensionLog.findMany({
    where: eq(suspensionLog.app_id, APP_ID),
    orderBy: [desc(suspensionLog.suspendedAt)],
    with: {
      user: true,
      suspendedByUser: true,
      liftedByUser: true,
    },
    limit: SUSPENSIONS_PER_PAGE,
    offset,
  });

  return suspensions;
}

export const getSuspensions = cache(getSuspensionsCore);

async function getSuspensionsCountCore() {

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(suspensionLog)
    .where(eq(suspensionLog.app_id, APP_ID));

  return count;
}

export const getSuspensionsCount = cache(getSuspensionsCountCore);

async function getSuspensionStatsCore() {

  const [activeResult, liftedResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(suspensionLog)
      .where(
        and(eq(suspensionLog.app_id, APP_ID), eq(suspensionLog.isActive, true))
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(suspensionLog)
      .where(
        and(eq(suspensionLog.app_id, APP_ID), eq(suspensionLog.isActive, false))
      ),
  ]);

  return {
    active: activeResult[0]?.count ?? 0,
    lifted: liftedResult[0]?.count ?? 0,
  };
}

export const getSuspensionStats = cache(getSuspensionStatsCore);

async function getSuspensionById(id: string) {
  const suspension = await db.query.suspensionLog.findFirst({
    where: and(eq(suspensionLog.id, id), eq(suspensionLog.app_id, APP_ID)),
    with: {
      user: true,
      suspendedByUser: true,
      liftedByUser: true,
    },
  });

  return suspension;
}

export async function revalidateSuspensionCache() {
}
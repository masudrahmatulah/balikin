'use server';

import { cache } from 'react';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { suspensionLog } from '@/db/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';
const SUSPENSIONS_PER_PAGE = 25;

async function getSuspensionsCore(page: number = 1) {
  'use cache';
  cacheLife('minutes');
  cacheTag('suspensions', 'admin-suspensions');

  const offset = (page - 1) * SUSPENSIONS_PER_PAGE;

  const suspensions = await db.query.suspensionLog.findMany({
    where: eq(suspensionLog.appId, APP_ID),
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
  'use cache';
  cacheLife('minutes');
  cacheTag('suspensions-count', 'admin-suspensions');

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(suspensionLog)
    .where(eq(suspensionLog.appId, APP_ID));

  return count;
}

export const getSuspensionsCount = cache(getSuspensionsCountCore);

async function getSuspensionStatsCore() {
  'use cache';
  cacheLife('seconds');
  cacheTag('suspension-stats', 'admin-suspensions');

  const [activeResult, liftedResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(suspensionLog)
      .where(
        and(eq(suspensionLog.appId, APP_ID), eq(suspensionLog.isActive, true))
      ),
    db
      .select({ count: sql<number>`count(*)` })
      .from(suspensionLog)
      .where(
        and(eq(suspensionLog.appId, APP_ID), eq(suspensionLog.isActive, false))
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
    where: and(eq(suspensionLog.id, id), eq(suspensionLog.appId, APP_ID)),
    with: {
      user: true,
      suspendedByUser: true,
      liftedByUser: true,
    },
  });

  return suspension;
}

export async function revalidateSuspensionCache() {
  revalidateTag('suspensions', 'max');
  revalidateTag('suspensions-count', 'max');
  revalidateTag('suspension-stats', 'max');
  revalidateTag('admin-suspensions', 'max');
}
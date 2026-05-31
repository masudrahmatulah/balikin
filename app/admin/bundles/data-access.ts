'use server';

import { cache } from 'react';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { count, sql, desc, eq } from 'drizzle-orm';

/**
 * Get bundle statistics with caching
 */
async function getBundleStatsCore() {

  const bundleStats = await db
    .select({
      bundleType: tags.bundleType,
      count: count(),
    })
    .from(tags)
    .where(sql`${tags.bundleType} IS NOT NULL AND ${tags.app_id} = 'balikin_id'`)
    .groupBy(tags.bundleType);

  return bundleStats;
}

/**
 * Cached version of getBundleStats
 */
export const getBundleStats = cache(getBundleStatsCore);

/**
 * Get recent bundle tags with caching
 */
async function getRecentBundlesCore(limit: number = 10) {

  const recentBundles = await db.query.tags.findMany({
    where: sql`${tags.bundleType} IS NOT NULL AND ${tags.app_id} = 'balikin_id'`,
    orderBy: [desc(tags.createdAt)],
    limit,
    columns: {
      id: true,
      slug: true,
      name: true,
      tier: true,
      bundleType: true,
      ownerId: true,
      createdAt: true,
    },
  });

  return recentBundles.map(tag => ({
    ...tag,
    createdAt: tag.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

/**
 * Cached version of getRecentBundles
 */
export const getRecentBundles = cache(getRecentBundlesCore);

/**
 * Get all bundle data in parallel
 */
export async function getBundlePageData() {
  const [bundleStats, recentBundles] = await Promise.all([
    getBundleStats(),
    getRecentBundles(10),
  ]);

  return { bundleStats, recentBundles };
}

/**
 * Invalidate bundle-related cache tags
 * Call this after any bundle operation
 */
export async function revalidateBundleCaches() {
}

/**
 * Get bundle count by type
 */
export async function getBundleCountByType(bundleStats: Array<{ bundleType: string | null; count: number }>, type: string): Promise<number> {
  return bundleStats.find(s => s.bundleType === type)?.count || 0;
}
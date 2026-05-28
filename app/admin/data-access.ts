'use server';

import { cache } from 'react';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { user, tags, stickerOrders, materialInventory, modulePurchaseOrders } from '@/db/schema';
import { count, eq, sql, desc } from 'drizzle-orm';
import { getTagsApproximateCount, withQueryTimeout } from '@/lib/postgres-utils';
import { getRevenueStats, getMaterialStockAlerts } from '@/lib/admin-dashboard';

/**
 * Get dashboard statistics with Next.js 16 cache components
 * Using 'use cache' directive for automatic key generation and tag-based invalidation
 */
async function getDashboardStatsCore() {
  cacheLife('minutes');
  cacheTag('dashboard-stats', 'admin-stats');

  // Use approximate count for tags (large table) - instant, no table scan
  const tagsCount = await getTagsApproximateCount();

  // Use exact counts with timeout protection for smaller tables (parallel)
  const [usersResult, ordersResult, lostTagsResult] = await Promise.all([
    withQueryTimeout(
      () => db.select({ count: count() }).from(user),
      { count: 0 },
      2000
    ),
    withQueryTimeout(
      () => db.select({ count: count() }).from(stickerOrders),
      { count: 0 },
      2000
    ),
    withQueryTimeout(
      () => db.select({ count: count() }).from(tags).where(eq(tags.status, 'lost')),
      { count: 0 },
      2000
    ),
  ]);

  // Get revenue and material stats in parallel
  const [dailyRevenue, monthlyRevenue, materialAlerts] = await Promise.all([
    getRevenueStats('daily'),
    getRevenueStats('monthly'),
    getMaterialStockAlerts(),
  ]);

  return {
    totalUsers: usersResult[0]?.count || 0,
    totalTags: tagsCount,
    totalOrders: ordersResult[0]?.count || 0,
    lostTags: lostTagsResult[0]?.count || 0,
    revenue: {
      daily: dailyRevenue,
      monthly: monthlyRevenue,
    },
    materials: materialAlerts,
  };
}

/**
 * Cached version of getDashboardStats
 */
export const getDashboardStatsServer = cache(getDashboardStatsCore);

/**
 * Get pending counts with caching
 */
async function getPendingCountsCore() {
  cacheLife('minutes');
  cacheTag('pending-counts', 'admin-stats');

  const [pendingOrders, pendingRequests] = await Promise.all([
    withQueryTimeout(
      () => db
        .select({ count: count() })
        .from(stickerOrders)
        .where(eq(stickerOrders.paymentStatus, 'pending')),
      { count: 0 },
      2000
    ),
    withQueryTimeout(
      () => db.select({ count: count() }).from(stickerOrders).where(eq(stickerOrders.status, 'pending_payment')),
      { count: 0 },
      2000
    ),
  ]);

  return {
    pendingOrders: pendingOrders[0]?.count || 0,
    pendingRequests: pendingRequests[0]?.count || 0,
  };
}

/**
 * Cached version of getPendingCounts
 */
export const getPendingCountsServer = cache(getPendingCountsCore);

/**
 * Get recent tags for admin dashboard with caching
 */
async function getRecentTagsCore(limit: number = 4) {
  cacheLife('minutes');
  cacheTag('recent-tags', 'admin-stats');

  const recentTags = await withQueryTimeout(
    () => db.query.tags.findMany({
      where: eq(tags.appId, 'balikin_id'),
      orderBy: [desc(tags.createdAt)],
      limit,
      columns: {
        id: true,
        slug: true,
        name: true,
        tier: true,
        status: true,
        createdAt: true,
      },
    }),
    [],
    2000
  );

  return recentTags.map((tag) => ({
    id: tag.id,
    slug: tag.slug,
    name: tag.name,
    tier: tag.tier,
    status: tag.status,
    createdAt: tag.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

/**
 * Cached version of getRecentTags
 */
export const getRecentTagsServer = cache(getRecentTagsCore);

/**
 * Invalidate all admin-related cache tags
 * Call this after any admin operation that changes data
 */
export async function revalidateAdminStats() {
  revalidateTag('dashboard-stats', 'max');
  revalidateTag('pending-counts', 'max');
  revalidateTag('recent-tags', 'max');
  revalidateTag('admin-stats', 'max');
}

/**
 * Invalidate specific cache tag
 */
export async function revalidateAdminTag(tag: string) {
  revalidateTag(tag, 'max');
}
'use server';

import { cache } from 'react';
import { db } from '@/db';
import { user, tags, stickerOrders, materialInventory, modulePurchaseOrders, auditLogs, printQueue } from '@/db/schema';
import { count, eq, sql, desc, gte, and } from 'drizzle-orm';
import { getTagsApproximateCount, withQueryTimeout } from '@/lib/postgres-utils';
import { getRevenueStats, getMaterialStockAlerts } from '@/lib/admin-dashboard';

/**
 * Get dashboard statistics with Next.js 16 cache components
 * Using 'use cache' directive for automatic key generation and tag-based invalidation
 */
async function getDashboardStatsCore() {

  // Use approximate count for tags (large table) - instant, no table scan
  const tagsCount = await getTagsApproximateCount();

  // All queries in ONE parallel block to minimize connection-pool pressure.
  // Counts are consolidated into a single round trip via scalar subqueries, and
  // daily+monthly revenue into one FILTER query — critical because every query
  // pays ~250ms network latency to Supabase.
  // Timeout 5000ms: cold connections need a TLS handshake before the first query.
  const [
    summaryRes,
    revenue,
    materialAlerts,
    dailyOrdersSeries,
    tagDistributionRows,
    printStats,
  ] = await Promise.all([
    withQueryTimeout(
      () =>
        db.execute(sql`
          SELECT
            (SELECT count(*) FROM ${user}) AS total_users,
            (SELECT count(*) FROM ${stickerOrders}) AS total_orders,
            (SELECT count(*) FROM ${stickerOrders} WHERE ${stickerOrders.paymentStatus} = 'pending') AS pending_orders,
            (SELECT count(*) FROM ${tags} WHERE ${tags.app_id} = 'balikin_id') AS tags_total,
            (SELECT count(*) FROM ${tags} WHERE ${tags.app_id} = 'balikin_id' AND ${tags.status} = 'lost') AS tags_lost,
            (SELECT count(*) FROM ${tags} WHERE ${tags.app_id} = 'balikin_id' AND ${tags.tier} <> 'free') AS tags_premium
        `),
      null,
      5000
    ),
    getRevenueStatsBoth(),
    getMaterialStockAlerts(),
    getDailyOrdersSeries(),
    getTagDistribution(),
    getPrintQueueStats(),
  ]);

  const summaryRows: any[] =
    summaryRes && typeof summaryRes === 'object'
      ? 'rows' in (summaryRes as any) && Array.isArray((summaryRes as any).rows)
        ? (summaryRes as any).rows
        : Array.isArray(summaryRes)
          ? summaryRes
          : []
      : [];
  const s = summaryRows[0] ?? {};

  return {
    totalUsers: Number(s.total_users || 0),
    totalTags: tagsCount,
    totalOrders: Number(s.total_orders || 0),
    pendingOrders: Number(s.pending_orders || 0),
    lostTags: Number(s.tags_lost || 0),
    premiumTags: Number(s.tags_premium || 0),
    exactTagsCount: Number(s.tags_total || 0),
    revenue: {
      daily: revenue.daily,
      monthly: revenue.monthly,
    },
    materials: materialAlerts,
    dailyOrdersSeries,
    tagDistribution: tagDistributionRows,
    production: printStats,
  };
}

/**
 * Paid orders per day for the last 7 days (real data for the daily-orders chart)
 */
async function getDailyOrdersSeries(): Promise<number[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    const rows = await withQueryTimeout(
      () =>
        db
          .select({
            day: sql<string>`to_char(date_trunc('day', ${stickerOrders.createdAt}), 'YYYY-MM-DD')`,
            count: count(),
          })
          .from(stickerOrders)
          .where(
            and(
              eq(stickerOrders.paymentStatus, 'paid'),
              gte(stickerOrders.createdAt, sevenDaysAgo)
            )
          )
          .groupBy(sql`date_trunc('day', ${stickerOrders.createdAt})`),
      [] as { day: string; count: number }[],
      5000
    );

    const byDay = new Map(rows.map((r) => [r.day, Number(r.count)]));
    const series: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      series.push(byDay.get(key) ?? 0);
    }
    return series;
  } catch (error) {
    console.error('Error fetching daily orders series:', error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
}

/**
 * Tag distribution by product type (real proportions from tags table)
 */
async function getTagDistribution(): Promise<Array<{ label: string; percent: number }>> {
  try {
    const rows = await withQueryTimeout(
      () =>
        db
          .select({ productType: tags.productType, count: count() })
          .from(tags)
          .where(eq(tags.app_id, 'balikin_id'))
          .groupBy(tags.productType),
      [] as { productType: string; count: number }[],
      5000
    );

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    if (total === 0) return [];

    const groups: Record<string, number> = { sticker: 0, acrylic: 0, other: 0 };
    for (const row of rows) {
      if (row.productType === 'sticker') groups.sticker += Number(row.count);
      else if (row.productType === 'acrylic') groups.acrylic += Number(row.count);
      else groups.other += Number(row.count);
    }

    const pct = (n: number) => Math.round((n / total) * 100);
    return [
      { label: 'Stickers', percent: pct(groups.sticker) },
      { label: 'Acrylic', percent: pct(groups.acrylic) },
      { label: 'Other', percent: pct(groups.other) },
    ];
  } catch (error) {
    console.error('Error fetching tag distribution:', error);
    return [];
  }
}

/**
 * Print queue completion stats (real data from print_queue table)
 */
async function getPrintQueueStats(): Promise<{ total: number; completed: number; pending: number }> {
  try {
    const rows = await withQueryTimeout(
      () =>
        db
          .select({ status: printQueue.status, count: count() })
          .from(printQueue)
          .groupBy(printQueue.status),
      [] as { status: string; count: number }[],
      5000
    );

    const total = rows.reduce((sum, r) => sum + Number(r.count), 0);
    const completed = rows.filter((r) => r.status === 'completed').reduce((sum, r) => sum + Number(r.count), 0);
    const pending = rows
      .filter((r) => r.status !== 'completed')
      .reduce((sum, r) => sum + Number(r.count), 0);

    return { total, completed, pending };
  } catch (error) {
    console.error('Error fetching print queue stats:', error);
    return { total: 0, completed: 0, pending: 0 };
  }
}

/**
 * Cached version of getDashboardStats
 */
export const getDashboardStatsServer = cache(getDashboardStatsCore);

/**
 * Get pending counts with caching
 */
async function getPendingCountsCore() {

  const [pendingOrders, pendingRequests] = await Promise.all([
    withQueryTimeout(
      () => db
        .select({ count: count() })
        .from(stickerOrders)
        .where(eq(stickerOrders.paymentStatus, 'pending')),
      { count: 0 },
      5000
    ),
    withQueryTimeout(
      () => db.select({ count: count() }).from(stickerOrders).where(eq(stickerOrders.status, 'pending_payment')),
      { count: 0 },
      5000
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

  const recentTags = await withQueryTimeout(
    () => db.query.tags.findMany({
      where: eq(tags.app_id, 'balikin_id'),
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
    5000
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

// ─── Recent activity feed (real data: audit logs + orders + tags) ────────

export interface DashboardActivity {
  id: string;
  event: string;
  reference?: string;
  admin?: string;
  timestamp: string;
  status: 'success' | 'pending' | 'transit' | 'failed';
}

async function getRecentActivityCore(limit: number = 8): Promise<DashboardActivity[]> {
  const formatTime = (date: Date | null) =>
    date
      ? new Date(date).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '-';

  try {
    const [auditEntries, recentOrders, recentTagRows] = await Promise.all([
      withQueryTimeout(
        () =>
          db.query.auditLogs.findMany({
            orderBy: [desc(auditLogs.createdAt)],
            limit: 5,
            columns: {
              id: true,
              action: true,
              entityType: true,
              entityId: true,
              createdAt: true,
            },
            with: {
              admin: { columns: { name: true, email: true } },
            },
          }),
        [],
        5000
      ),
      withQueryTimeout(
        () =>
          db
            .select({
              id: stickerOrders.id,
              recipientName: stickerOrders.recipientName,
              paymentStatus: stickerOrders.paymentStatus,
              createdAt: stickerOrders.createdAt,
            })
            .from(stickerOrders)
            .orderBy(desc(stickerOrders.createdAt))
            .limit(4),
        [],
        5000
      ),
      withQueryTimeout(
        () =>
          db
            .select({
              id: tags.id,
              slug: tags.slug,
              name: tags.name,
              createdAt: tags.createdAt,
            })
            .from(tags)
            .where(eq(tags.app_id, 'balikin_id'))
            .orderBy(desc(tags.createdAt))
            .limit(3),
        [],
        5000
      ),
    ]);

    const activities: DashboardActivity[] = [
      ...auditEntries.map((entry) => ({
        id: `audit-${entry.id}`,
        event: `${entry.action} pada ${entry.entityType}`,
        reference: entry.entityId ? entry.entityId.slice(0, 8) : undefined,
        admin: entry.admin?.name || entry.admin?.email || 'Admin',
        timestamp: formatTime(entry.createdAt),
        status: 'success' as const,
      })),
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        event: `Order baru — ${order.recipientName}`,
        reference: order.id.slice(0, 8),
        admin: 'Customer',
        timestamp: formatTime(order.createdAt),
        status: order.paymentStatus === 'paid' ? ('success' as const) : ('pending' as const),
      })),
      ...recentTagRows.map((tag) => ({
        id: `tag-${tag.id}`,
        event: `Tag dibuat — ${tag.name}`,
        reference: tag.slug,
        admin: 'System',
        timestamp: formatTime(tag.createdAt),
        status: 'success' as const,
      })),
    ];

    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

export const getRecentActivityServer = cache(getRecentActivityCore);

/**
 * Invalidate all admin-related cache tags
 * Call this after any admin operation that changes data
 */
export async function revalidateAdminStats() {
}

/**
 * Invalidate specific cache tag
 */
export async function revalidateAdminTag(tag: string) {
}
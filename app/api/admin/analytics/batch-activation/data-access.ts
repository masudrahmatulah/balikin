/**
 * Batch Activation Metrics Data Access Layer
 * Provides institutional bundle order activation metrics
 */


import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/db';
import { tags, tagBundles, stickerOrders } from '@/db/schema';
import { and, desc, sql, count, eq } from 'drizzle-orm';

cacheLife('minutes');
cacheTag('admin-analytics', 'batch-activation');

interface BundleMetric {
  institution: string;
  bundleType: string;
  totalItems: number;
  claimedItems: number;
  activationRate: number;
  deliveredAt: string | null;
}

interface BatchActivationData {
  totalBundles: number;
  averageActivationRate: number;
  lowActivationBundles: BundleMetric[];
  bundles: BundleMetric[];
}

/**
 * Get batch activation metrics with optimized query (no N+1)
 */
export async function getBatchActivationMetricsCached(): Promise<BatchActivationData> {
  try {
    const bundleMetrics: BundleMetric[] = [];

    const bundleOrders = await db
      .select({
        id: tagBundles.id,
        orderId: tagBundles.orderId,
        productType: tagBundles.productType,
        createdAt: tagBundles.createdAt,
      })
      .from(tagBundles)
      .where(
        and(
          eq(tagBundles.appId, 'balikin_id'),
          sql`${tagBundles.productType} = 'bundle'`
        )
      )
      .orderBy(desc(tagBundles.createdAt))
      .limit(50);

    const bundleIds = bundleOrders.map(b => b.id);
    const orderIds = bundleOrders.map(b => b.orderId).filter(Boolean) as string[];

    interface BundleTagCount {
      bundleId: string | null;
      total: number;
      claimed: number;
    }

    interface OrderData {
      id: string;
      recipientName: string | null;
      createdAt: Date | null;
    }

    const [bundleTagsCounts, ordersData] = await Promise.allSettled([
      db
        .select({
          bundleId: tags.bundleId,
          total: count(),
          claimed: sql<number>`COUNT(CASE WHEN ${tags.ownerId} IS NOT NULL THEN 1 END)`,
        })
        .from(tags)
        .where(
          and(
            eq(tags.appId, 'balikin_id'),
            sql`${tags.bundleId} = ANY(${bundleIds})`
          )
        )
        .groupBy(tags.bundleId),

      orderIds.length > 0
        ? db
            .select({
              id: stickerOrders.id,
              recipientName: stickerOrders.recipientName,
              createdAt: stickerOrders.createdAt,
            })
            .from(stickerOrders)
            .where(
              and(
                eq(stickerOrders.appId, 'balikin_id'),
                sql`${stickerOrders.id} = ANY(${orderIds})`
              )
            )
        : Promise.resolve<OrderData[]>([]),
    ]);

    const tagCountsMap = new Map<string, BundleTagCount>(
      bundleTagsCounts.status === 'fulfilled'
        ? (bundleTagsCounts.value as BundleTagCount[]).map(t => [t.bundleId || '', t])
        : []
    );

    const orderMap = new Map<string, OrderData>(
      ordersData.status === 'fulfilled'
        ? (ordersData.value as OrderData[]).map(o => [o.id, o])
        : []
    );

    for (const bundle of bundleOrders) {
      const tagCount = tagCountsMap.get(bundle.id);
      const order = orderMap.get(bundle.orderId);

      const totalItems = tagCount?.total ?? 0;
      const claimedItems = tagCount?.claimed ?? 0;
      const activationRate = totalItems > 0 ? (claimedItems / totalItems) * 100 : 0;

      bundleMetrics.push({
        institution: order?.recipientName ?? 'Unknown',
        bundleType: 'Standard',
        totalItems,
        claimedItems,
        activationRate: Math.round(activationRate * 10) / 10,
        deliveredAt: order?.createdAt?.toISOString() ?? null,
      });
    }

    bundleMetrics.sort((a, b) => a.activationRate - b.activationRate);

    return {
      totalBundles: bundleMetrics.length,
      averageActivationRate: bundleMetrics.length > 0
        ? Math.round(
            (bundleMetrics.reduce((sum, m) => sum + m.activationRate, 0) /
              bundleMetrics.length) * 10
          ) / 10
        : 0,
      lowActivationBundles: bundleMetrics.filter(m => m.activationRate < 50),
      bundles: bundleMetrics,
    };
  } catch {
    return {
      totalBundles: 0,
      averageActivationRate: 0,
      lowActivationBundles: [],
      bundles: [],
    };
  }
}
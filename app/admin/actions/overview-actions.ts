'use server'

import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { stickerOrders, tagBundles, tags, user, notificationLogs, scanLogs } from "@/db/schema";
import { count, eq, and, isNull, gte, sql, desc, or } from "drizzle-orm";
import { withQueryTimeout, getTagsApproximateCount } from "@/lib/postgres-utils";

/**
 * Get manufacturing queue statistics - Ready to Print counts by material type
 * Server Action - cached for 5 minutes
 */
export async function getManufacturingQueueStats() {
  const cache = unstable_cache(
    async () => {
      // Count orders by product type that are ready for fulfillment
      // Product types: 'sticker' (Vinyl), 'premium' (Acrylic), bundle types (Bundling Kits)

      let vinylCount = 0;
      let acrylicCount = 0;
      let bundlesCount = 0;

      try {
        // Vinyl Stickers: productType = 'sticker' AND status = 'ready_for_fulfillment'
        const vinylResult = await withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(
            and(
              eq(stickerOrders.productType, 'sticker'),
              eq(stickerOrders.status, 'ready_for_fulfillment')
            )
          ),
          { count: 0 },
          2000
        );
        vinylCount = typeof vinylResult[0]?.count === 'number'
          ? vinylResult[0].count
          : parseInt(vinylResult[0]?.count || '0', 10);
      } catch (e) {
        console.warn("Could not query vinyl orders:", e);
      }

      try {
        // Acrylic Premium: productType = 'premium' AND status = 'ready_for_fulfillment'
        const acrylicResult = await withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(
            and(
              eq(stickerOrders.productType, 'premium'),
              eq(stickerOrders.status, 'ready_for_fulfillment')
            )
          ),
          { count: 0 },
          2000
        );
        acrylicCount = typeof acrylicResult[0]?.count === 'number'
          ? acrylicResult[0].count
          : parseInt(acrylicResult[0]?.count || '0', 10);
      } catch (e) {
        console.warn("Could not query acrylic orders:", e);
      }

      try {
        // Bundling Kits: productType = 'bundle' AND status = 'ready_for_fulfillment'
        const bundleResult = await withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(
            and(
              eq(stickerOrders.productType, 'bundle'),
              eq(stickerOrders.status, 'ready_for_fulfillment')
            )
          ),
          { count: 0 },
          2000
        );
        bundlesCount = typeof bundleResult[0]?.count === 'number'
          ? bundleResult[0].count
          : parseInt(bundleResult[0]?.count || '0', 10);
      } catch (e) {
        console.warn("Could not query bundle orders:", e);
      }

      return {
        vinyl: vinylCount,
        acrylic: acrylicCount,
        bundles: bundlesCount,
        total: vinylCount + acrylicCount + bundlesCount,
      };
    },
    ["admin-manufacturing-queue-stats-v1"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-overview", "manufacturing-queue"],
    }
  );

  return await cache();
}

/**
 * Get system health statistics for WhatsApp API and notification system
 * Server Action - cached for 2 minutes (needs fresh data)
 */
export async function getSystemHealthStats() {
  const cache = unstable_cache(
    async () => {
      // Calculate success rate for notifications in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      let totalNotifications = 0;
      let successfulNotifications = 0;
      let failedNotifications = 0;

      try {
        const notifications = await withQueryTimeout(
          () => db.select({
            status: notificationLogs.status,
            count: count(),
          }).from(notificationLogs).where(
            gte(notificationLogs.createdAt, twentyFourHoursAgo)
          ).groupBy(notificationLogs.status),
          [],
          3000
        );

        totalNotifications = notifications.reduce((sum, n) => sum + n.count, 0);
        successfulNotifications = notifications
          .filter(n => n.status === 'sent' || n.status === 'delivered')
          .reduce((sum, n) => sum + n.count, 0);
        failedNotifications = notifications
          .filter(n => n.status === 'failed')
          .reduce((sum, n) => sum + n.count, 0);
      } catch (e) {
        console.warn("Could not query notification stats:", e);
      }

      const successRate = totalNotifications > 0
        ? (successfulNotifications / totalNotifications) * 100
        : 100;

      // Determine system status based on success rate
      let systemStatus: 'online' | 'degraded' | 'offline' = 'online';
      if (totalNotifications > 0 && successRate < 70) {
        systemStatus = 'offline';
      } else if (totalNotifications > 0 && successRate < 90) {
        systemStatus = 'degraded';
      }

      // Note: API quota would need to be tracked separately or from external service
      // For now, we'll return placeholder data
      return {
        systemStatus,
        successRate: Math.round(successRate * 10) / 10,
        totalNotifications,
        successfulNotifications,
        failedNotifications,
        apiQuota: {
          remaining: 8500, // Placeholder - should come from API provider
          total: 10000,
          resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };
    },
    ["admin-system-health-stats-v1"],
    {
      revalidate: 120, // 2 minutes
      tags: ["admin-overview", "system-health"],
    }
  );

  return await cache();
}

/**
 * Get verification queue - pending Gold Badge verification requests
 * Server Action - cached for 5 minutes
 */
export async function getVerificationQueue(limit = 10) {
  const cache = unstable_cache(
    async (limit = 10) => {
      // Get users who have requested verification but not yet approved
      // Note: user.isVerified column doesn't exist in schema, returning empty for now
      // This is a placeholder for future verification request system

      try {
        // Query for recent users as placeholder (no isVerified filter)
        const recentUsers = await withQueryTimeout(
          () => db.query.user.findMany({
            orderBy: [desc(user.createdAt)],
            limit,
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          }),
          [],
          2000
        );

        // Return empty for now - verification system not implemented
        return [];
      } catch (e) {
        console.warn("Could not query verification queue:", e);
        return [];
      }
    },
    ["admin-verification-queue-v1"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-overview", "verification-queue"],
    }
  );

  return await cache(limit);
}

/**
 * Get Lost & Found success rate metrics
 * Server Action - cached for 10 minutes
 */
export async function getLostFoundSuccessRate(days = 30) {
  const cache = unstable_cache(
    async (days = 30) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let totalLostEvents = 0;
      let recoveredItems = 0;
      let recoveryTimes: number[] = [];

      try {
        // Get tags that were lost in the period
        const lostTags = await withQueryTimeout(
          () => db.select({
            id: tags.id,
            status: tags.status,
          }).from(tags).where(
            gte(tags.createdAt, startDate)
          ),
          [],
          3000
        );

        totalLostEvents = lostTags.filter(t => t.status === 'lost').length;

        // Get scan logs for lost tags to calculate recovery time
        if (totalLostEvents > 0) {
          const lostTagIds = lostTags.filter(t => t.status === 'lost').map(t => t.id);

          const recoveryScans = await withQueryTimeout(
            () => db.select({
              tagId: scanLogs.tagId,
              scannedAt: scanLogs.scannedAt,
            }).from(scanLogs).where(
              sql`${scanLogs.tagId} = ANY(${lostTagIds})`
            ),
            [],
            3000
          );

          // Count recovered tags (tags that were scanned while lost)
          const recoveredTagIds = new Set(recoveryScans.map(s => s.tagId));
          recoveredItems = recoveredTagIds.size;

          // Calculate recovery times for recovered items
          for (const tag of lostTags.filter(t => t.status === 'lost')) {
            if (recoveredTagIds.has(tag.id)) {
              const firstScan = recoveryScans
                .filter(s => s.tagId === tag.id)
                .sort((a, b) =>
                  new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
                )[0];

              if (firstScan && tag.createdAt) {
                const recoveryTime = new Date(firstScan.scannedAt).getTime() -
                  new Date(tag.createdAt).getTime();
                recoveryTimes.push(recoveryTime);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Could not query lost & found stats:", e);
      }

      const recoveryRate = totalLostEvents > 0
        ? (recoveredItems / totalLostEvents) * 100
        : 0;

      const averageRecoveryTime = recoveryTimes.length > 0
        ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
        : 0;

      // Convert milliseconds to hours
      const avgHours = averageRecoveryTime / (1000 * 60 * 60);

      return {
        recoveryRate: Math.round(recoveryRate * 10) / 10,
        totalLostEvents,
        recoveredItems,
        averageRecoveryHours: Math.round(avgHours * 10) / 10,
        period: `${days} days`,
      };
    },
    ["admin-lost-found-rate-v1"],
    {
      revalidate: 600, // 10 minutes
      tags: ["admin-analytics", "lost-found"],
    }
  );

  return await cache(days);
}

/**
 * Get geospatial scan data for heatmap visualization
 * Server Action - cached for 15 minutes
 */
export async function getGeoScanData(days = 7) {
  const cache = unstable_cache(
    async (days = 7) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let geoData: Array<{ city: string | null; count: number }> = [];

      try {
        // Aggregate scans by city
        const cityScans = await withQueryTimeout(
          () => db.select({
            city: scanLogs.city,
            count: count(),
          }).from(scanLogs).where(
            and(
              gte(scanLogs.scannedAt, startDate),
              sql`${scanLogs.city} IS NOT NULL`
            )
          ).groupBy(scanLogs.city)
          .orderBy(desc(count()))
          .limit(20),
          [],
          3000
        );

        geoData = cityScans.map(s => ({
          city: s.city,
          count: typeof s.count === 'number' ? s.count : parseInt(s.count || '0', 10),
        }));
      } catch (e) {
        console.warn("Could not query geo scan data:", e);
      }

      return {
        period: `${days} days`,
        totalScans: geoData.reduce((sum, d) => sum + d.count, 0),
        topCities: geoData.slice(0, 10),
        allCities: geoData,
      };
    },
    ["admin-geo-scans-v1"],
    {
      revalidate: 900, // 15 minutes
      tags: ["admin-analytics", "geo-scans"],
    }
  );

  return await cache(days);
}

/**
 * Get batch activation metrics for institutional bundle orders
 * Server Action - cached for 10 minutes
 */
export async function getBatchActivationMetrics() {
  const cache = unstable_cache(
    async () => {
      let metrics: Array<{
        institution: string;
        bundleType: string;
        totalItems: number;
        claimedItems: number;
        activationRate: number;
        deliveredAt: string | null;
      }> = [];

      try {
        // Get bundle orders
        const bundleOrders = await withQueryTimeout(
          () => db.query.tagBundles.findMany({
            where: sql`${tagBundles.productType} = 'bundle'`,
            orderBy: [desc(tagBundles.createdAt)],
            limit: 50,
          }),
          [],
          3000
        );

        for (const bundle of bundleOrders) {
          // Get all tags in this bundle
          const bundleTags = await db.query.tags.findMany({
            where: eq(tags.bundleId, bundle.id),
            columns: {
              id: true,
              ownerId: true,
              claimedAt: true,
            },
          });

          const totalItems = bundleTags.length;
          const claimedItems = bundleTags.filter(t => t.ownerId !== null).length;
          const activationRate = totalItems > 0 ? (claimedItems / totalItems) * 100 : 0;

          // Try to get institution info from order
          let institution = "Unknown";
          let deliveredAt: string | null = null;

          try {
            const order = await db.query.stickerOrders.findFirst({
              where: eq(stickerOrders.id, bundle.orderId),
              columns: {
                recipientName: true,
                city: true,
                createdAt: true,
              },
            });

            if (order) {
              institution = order.recipientName;
              deliveredAt = order.createdAt?.toISOString() || null;
            }
          } catch (e) {
            // Order might not exist
          }

          metrics.push({
            institution,
            bundleType: "Standard", // Would need more fields to determine type
            totalItems,
            claimedItems,
            activationRate: Math.round(activationRate * 10) / 10,
            deliveredAt,
          });
        }
      } catch (e) {
        console.warn("Could not query batch activation metrics:", e);
      }

      // Sort by activation rate (ascending - lowest first for alerts)
      metrics.sort((a, b) => a.activationRate - b.activationRate);

      return {
        totalBundles: metrics.length,
        averageActivationRate: metrics.length > 0
          ? Math.round((metrics.reduce((sum, m) => sum + m.activationRate, 0) / metrics.length) * 10) / 10
          : 0,
        lowActivationBundles: metrics.filter(m => m.activationRate < 50),
        bundles: metrics,
      };
    },
    ["admin-batch-activation-v1"],
    {
      revalidate: 600, // 10 minutes
      tags: ["admin-analytics", "batch-activation"],
    }
  );

  return await cache();
}

/**
 * Get enhanced conversion funnel data
 * Server Action - cached for 15 minutes
 */
export async function getConversionFunnelData(timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly') {
  const cache = unstable_cache(
    async (timeRange: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
      const startDate = new Date();
      if (timeRange === 'daily') {
        startDate.setHours(startDate.getHours() - 24);
      } else if (timeRange === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30);
      }

      let funnelStages = [
        { stage: 'Free Users (Digital DIY)', count: 0 },
        { stage: 'Sticker Buyers', count: 0 },
        { stage: 'Premium Upgrades', count: 0 },
        { stage: 'Bundle Activations', count: 0 },
      ];

      try {
        // Free Users: All users created in period (simplified)
        const freeUsers = await withQueryTimeout(
          () => db.select({ count: count() }).from(user).where(
            gte(user.createdAt, startDate)
          ),
          { count: 0 },
          2000
        );
        funnelStages[0].count = typeof freeUsers[0]?.count === 'number'
          ? freeUsers[0].count
          : parseInt(freeUsers[0]?.count || '0', 10);

        // Sticker Buyers: sticker orders in period
        const stickerOrdersCount = await withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(
            and(
              eq(stickerOrders.productType, 'sticker'),
              gte(stickerOrders.createdAt, startDate)
            )
          ),
          { count: 0 },
          2000
        );
        funnelStages[1].count = typeof stickerOrdersCount[0]?.count === 'number'
          ? stickerOrdersCount[0].count
          : parseInt(stickerOrdersCount[0]?.count || '0', 10);

        // Premium Upgrades: premium product orders in period
        const premiumOrdersCount = await withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(
            and(
              eq(stickerOrders.productType, 'premium'),
              gte(stickerOrders.createdAt, startDate)
            )
          ),
          { count: 0 },
          2000
        );
        funnelStages[2].count = typeof premiumOrdersCount[0]?.count === 'number'
          ? premiumOrdersCount[0].count
          : parseInt(premiumOrdersCount[0]?.count || '0', 10);

        // Bundle Activations: bundle orders where tags are claimed
        const bundleOrders = await withQueryTimeout(
          () => db.query.tagBundles.findMany({
            where: and(
              eq(tagBundles.productType, 'bundle'),
              gte(tagBundles.createdAt, startDate)
            ),
            columns: {
              id: true,
            },
          }),
          [],
          3000
        );

        let activatedBundles = 0;
        for (const bundle of bundleOrders) {
          const bundleTags = await db.query.tags.findMany({
            where: eq(tags.bundleId, bundle.id),
            columns: {
              ownerId: true,
            },
          });

          // If at least one tag in bundle is claimed, count as activated
          if (bundleTags.some(t => t.ownerId !== null)) {
            activatedBundles++;
          }
        }
        funnelStages[3].count = activatedBundles;
      } catch (e) {
        console.warn("Could not query conversion funnel:", e);
      }

      // Calculate conversion rates
      const totalUsers = funnelStages[0].count;
      const funnelData = funnelStages.map((stage, index) => ({
        ...stage,
        conversionRate: index === 0 ? 100 : (totalUsers > 0 ? (stage.count / totalUsers) * 100 : 0),
        dropOffRate: index > 0 && totalUsers > 0
          ? ((funnelStages[index - 1].count - stage.count) / funnelStages[index - 1].count) * 100
          : 0,
      }));

      return {
        timeRange,
        funnelData,
      };
    },
    ["admin-conversion-funnel-v2"],
    {
      revalidate: 900, // 15 minutes
      tags: ["admin-analytics", "conversion-funnel"],
    }
  );

  return await cache(timeRange);
}
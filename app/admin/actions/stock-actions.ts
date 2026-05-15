'use server'

import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { user, tags, stickerOrders } from "@/db/schema";
import { count, eq, desc, sql } from "drizzle-orm";

/**
 * Get stock statistics with caching
 * Server Action - can safely import database
 * Cached for 2 minutes - production critical data
 */
export async function getStockStatsServer() {
  const cache = unstable_cache(
    async () => {
      const [totalProduced, totalClaimed] = await Promise.all([
        db.select({ count: count() }).from(tags),
        db.select({ count: count() }).from(tags).where(sql`${tags.ownerId} IS NOT NULL`),
      ]);

      // Get tier-specific stats
      let stickerCount = { produced: 0, claimed: 0 };
      let acrylicCount = { produced: 0, claimed: 0 };

      try {
        const stickerData = await db
          .select({ count: count(), claimed: count(tags.ownerId) })
          .from(tags)
          .where(eq(tags.tier, "sticker"));
        stickerCount = {
          produced: stickerData[0]?.count || 0,
          claimed: stickerData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query sticker tier data:", e);
      }

      try {
        const acrylicData = await db
          .select({ count: count(), claimed: count(tags.ownerId) })
          .from(tags)
          .where(eq(tags.tier, "premium"));
        acrylicCount = {
          produced: acrylicData[0]?.count || 0,
          claimed: acrylicData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query premium tier data:", e);
      }

      return {
        totalProduced: totalProduced[0]?.count || 0,
        totalClaimed: totalClaimed[0]?.count || 0,
        lowStockThreshold: 50,
        byType: {
          stickers: stickerCount,
          acrylic: acrylicCount,
          bundles: { produced: 0, claimed: 0 },
        },
      };
    },
    ["admin-stock-stats"],
    {
      revalidate: 120, // 2 minutes
      tags: ["admin-stats", "stock-stats"],
    }
  );

  return await cache();
}

/**
 * Get dashboard statistics with caching
 * Server Action - can safely import database
 * Cached for 5 minutes to reduce database load
 */
export async function getDashboardStatsServer() {
  const cache = unstable_cache(
    async () => {
      const [usersResult, tagsResult, ordersResult, lostTagsResult] = await Promise.all([
        db.select({ count: count() }).from(user),
        db.select({ count: count() }).from(tags),
        db.select({ count: count() }).from(stickerOrders),
        db.select({ count: count() }).from(tags).where(eq(tags.status, "lost")),
      ]);

      const { getRevenueStats, getMaterialStockAlerts } = await import("@/lib/admin-dashboard");
      const [dailyRevenue, monthlyRevenue, materialAlerts] = await Promise.all([
        getRevenueStats("daily"),
        getRevenueStats("monthly"),
        getMaterialStockAlerts(),
      ]);

      return {
        totalUsers: usersResult[0]?.count || 0,
        totalTags: tagsResult[0]?.count || 0,
        totalOrders: ordersResult[0]?.count || 0,
        lostTags: lostTagsResult[0]?.count || 0,
        revenue: {
          daily: dailyRevenue,
          monthly: monthlyRevenue,
        },
        materials: materialAlerts,
      };
    },
    ["admin-dashboard-stats-v2"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-stats"],
    }
  );

  return await cache();
}

/**
 * Get pending counts with caching
 * Server Action - can safely import database
 * Cached for 1 minute - time-sensitive data
 */
export async function getPendingCountsServer() {
  const cache = unstable_cache(
    async () => {
      const [pendingOrders, pendingRequests] = await Promise.all([
        db
          .select({ count: count() })
          .from(stickerOrders)
          .where(eq(stickerOrders.paymentStatus, "pending")),
        db.select({ count: count() }).from(stickerOrders).where(eq(stickerOrders.status, "pending_payment")),
      ]);

      return {
        pendingOrders: pendingOrders[0]?.count || 0,
        pendingRequests: pendingRequests[0]?.count || 0,
      };
    },
    ["admin-pending-counts"],
    {
      revalidate: 60, // 1 minute
      tags: ["admin-stats"],
    }
  );

  return await cache();
}

/**
 * Get recent users with caching
 * Server Action - can safely import database
 * Cached for 5 minutes
 */
export async function getRecentUsersServer(limit = 10) {
  const cache = unstable_cache(
    async (limit = 10) => {
      const users = await db.query.user.findMany({
        orderBy: [desc(user.createdAt)],
        limit,
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          division: true,
          createdAt: true,
        },
      });

      return users;
    },
    ["admin-recent-users"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-users"],
    }
  );

  return await cache(limit);
}

/**
 * Get detailed stock information for the production dashboard
 * Server Action - can safely import database
 * Cached for 5 minutes - detailed stock data
 */
export async function getDetailedStockServer(
  filterByTier: string | undefined,
  filterByStatus: string | undefined,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  pageSize: number = 25,
  currentPage: number = 1
) {
  const cache = unstable_cache(
    async (filterByTier, filterByStatus, sortBy, sortOrder, pageSize, currentPage) => {
      // Base query
      const query = db.select({
        id: tags.id,
        slug: tags.slug,
        tier: tags.tier,
        status: tags.status,
        name: tags.name,
        ownerEmail: tags.contactWhatsapp,
        createdAt: tags.createdAt,
      }).from(tags);

      // Apply filters
      if (filterByTier) {
        query.where(eq(tags.tier, filterByTier));
      }
      if (filterByStatus) {
        query.where(eq(tags.status, filterByStatus));
      }

      // Apply sorting
      query.orderBy([sortBy, 'createdAt'], [sortOrder, 'desc']);

      // Apply pagination
      const offset = (currentPage - 1) * pageSize;
      query.limit(pageSize).offset(offset);

      const result = await query;

      // Get total count for pagination
      const totalCount = await db.select({ count: count() }).from(tags);
      const total = parseInt(totalCount[0]?.count || '0', 10);

      return {
        items: result,
        total,
        pageSize,
        currentPage,
      };
    },
    [
      "admin-detailed-stock",
      filterByTier,
      filterByStatus,
      sortBy,
      sortOrder,
      pageSize,
      currentPage,
    ],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-stats"],
    }
  );

  return await cache(filterByTier, filterByStatus, sortBy, sortOrder, pageSize, currentPage);
}

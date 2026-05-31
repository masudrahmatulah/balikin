'use server'

import { unstable_cache } from "next/cache";
import { db } from "@/db";
import { user, tags, stickerOrders } from "@/db/schema";
import { count, eq, desc, sql, asc, or, like, and, isNull, isNotNull } from "drizzle-orm";
import { getTagsApproximateCount, withQueryTimeout } from "@/lib/postgres-utils";

/**
 * Get stock statistics with caching
 * Server Action - can safely import database
 * Cached for 10 minutes - uses approximate counts for large tables
 */
export async function getStockStatsServer() {
  const cache = unstable_cache(
    async () => {
      // Use approximate count for total produced - instant, no table scan
      const totalProduced = await getTagsApproximateCount();

      // Use approximate count with timeout for claimed tags
      const claimedResult = await withQueryTimeout(
        () => db.select({ count: count() }).from(tags).where(sql`${tags.ownerId} IS NOT NULL`),
        { count: 0 },
        2000
      );

      // Get tier-specific stats with timeout protection
      // We need to categorize all tags without overlapping counts
      // Categories: stickers, acrylic, bundles, freeTags, lost
      let stickersCount = { produced: 0, claimed: 0 };
      let acrylicCount = { produced: 0, claimed: 0 };
      let bundlesCount = { produced: 0, claimed: 0 };
      let freeTagsCount = { produced: 0, claimed: 0 };
      let lostCount = { produced: 0, claimed: 0 };

      // Stickers: tier="sticker" (regardless of bundleType or status)
      try {
        const stickerData = await withQueryTimeout(
          () => db
            .select({ count: count(), claimed: count(tags.ownerId) })
            .from(tags)
            .where(eq(tags.tier, "sticker")),
          { count: 0, claimed: 0 },
          2000
        );
        stickersCount = {
          produced: stickerData[0]?.count || 0,
          claimed: stickerData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query sticker tier data:", e);
      }

      // Acrylic: tier="premium" (regardless of bundleType or status)
      try {
        const acrylicData = await withQueryTimeout(
          () => db
            .select({ count: count(), claimed: count(tags.ownerId) })
            .from(tags)
            .where(eq(tags.tier, "premium")),
          { count: 0, claimed: 0 },
          2000
        );
        acrylicCount = {
          produced: acrylicData[0]?.count || 0,
          claimed: acrylicData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query premium tier data:", e);
      }

      // Bundles: bundleType IS NOT NULL AND tier NOT IN ("sticker", "premium")
      try {
        const bundlesData = await withQueryTimeout(
          () => db
            .select({ count: count(), claimed: count(tags.ownerId) })
            .from(tags)
            .where(
              and(
                isNotNull(tags.bundleType),
                sql`${tags.tier} != 'sticker'`,
                sql`${tags.tier} != 'premium'`
              )
            ),
          { count: 0, claimed: 0 },
          2000
        );
        bundlesCount = {
          produced: bundlesData[0]?.count || 0,
          claimed: bundlesData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query bundles data:", e);
      }

      // Free Tags: tier="free" AND bundleType IS NULL AND status!="lost"
      try {
        const freeTagsData = await withQueryTimeout(
          () => db
            .select({ count: count(), claimed: count(tags.ownerId) })
            .from(tags)
            .where(
              and(
                eq(tags.tier, "free"),
                isNull(tags.bundleType),
                sql`${tags.status} != 'lost'`
              )
            ),
          { count: 0, claimed: 0 },
          2000
        );
        freeTagsCount = {
          produced: freeTagsData[0]?.count || 0,
          claimed: freeTagsData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query free tags data:", e);
      }

      // Lost: status="lost" (regardless of other fields)
      try {
        const lostData = await withQueryTimeout(
          () => db
            .select({ count: count(), claimed: count(tags.ownerId) })
            .from(tags)
            .where(eq(tags.status, "lost")),
          { count: 0, claimed: 0 },
          2000
        );
        lostCount = {
          produced: lostData[0]?.count || 0,
          claimed: lostData[0]?.claimed || 0,
        };
      } catch (e) {
        console.warn("Could not query lost tags data:", e);
      }

      return {
        totalProduced,
        totalClaimed: claimedResult[0]?.count || 0,
        lowStockThreshold: 50,
        byType: {
          stickers: stickersCount,
          acrylic: acrylicCount,
          bundles: bundlesCount,
          freeTags: freeTagsCount,
          lost: lostCount,
        },
      };
    },
    ["admin-stock-stats-v2"],
    {
      revalidate: 600, // 10 minutes
      tags: ["admin-stats", "stock-stats"],
    }
  );

  return await cache();
}

/**
 * Get dashboard statistics with caching
 * Server Action - can safely import database
 * Cached for 15 minutes to reduce database load - uses approximate counts for large tables
 */
export async function getDashboardStatsServer() {
  const cache = unstable_cache(
    async () => {
      // Use approximate count for tags (large table) - instant, no table scan
      const tagsCount = await getTagsApproximateCount();

      // Use exact counts with timeout protection for smaller tables
      const [usersResult, ordersResult] = await Promise.all([
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
      ]);

      // For lost tags, also use timeout protection - this has a WHERE clause so it's slower
      const lostTagsResult = await withQueryTimeout(
        () => db.select({ count: count() }).from(tags).where(eq(tags.status, "lost")),
        { count: 0 },
        2000
      );

      const { getRevenueStats, getMaterialStockAlerts } = await import("@/lib/admin-dashboard");
      const [dailyRevenue, monthlyRevenue, materialAlerts] = await Promise.all([
        getRevenueStats("daily"),
        getRevenueStats("monthly"),
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
    },
    ["admin-dashboard-stats-v3"],
    {
      revalidate: 900, // 15 minutes - dashboard stats don't need to be real-time
      tags: ["admin-stats"],
    }
  );

  return await cache();
}

/**
 * Get pending counts with caching
 * Server Action - can safely import database
 * Cached for 2 minutes - time-sensitive data with timeout protection
 */
export async function getPendingCountsServer() {
  const cache = unstable_cache(
    async () => {
      const [pendingOrders, pendingRequests] = await Promise.all([
        withQueryTimeout(
          () => db
            .select({ count: count() })
            .from(stickerOrders)
            .where(eq(stickerOrders.paymentStatus, "pending")),
          { count: 0 },
          2000
        ),
        withQueryTimeout(
          () => db.select({ count: count() }).from(stickerOrders).where(eq(stickerOrders.status, "pending_payment")),
          { count: 0 },
          2000
        ),
      ]);

      return {
        pendingOrders: pendingOrders[0]?.count || 0,
        pendingRequests: pendingRequests[0]?.count || 0,
      };
    },
    ["admin-pending-counts-v2"],
    {
      revalidate: 120, // 2 minutes
      tags: ["admin-stats"],
    }
  );

  return await cache();
}

/**
 * Get recent users with caching
 * Server Action - can safely import database
 * Cached for 10 minutes with timeout protection
 */
export async function getRecentUsersServer(limit = 10) {
  const cache = unstable_cache(
    async (limit = 10) => {
      const users = await withQueryTimeout(
        () => db.query.user.findMany({
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
        }),
        [],
        2000
      );

      return users;
    },
    ["admin-recent-users-v2"],
    {
      revalidate: 600, // 10 minutes
      tags: ["admin-users"],
    }
  );

  return await cache(limit);
}

/**
 * Get recent tags for admin dashboard
 * Server Action - can safely import database
 * Cached for 5 minutes with timeout protection
 */
export async function getRecentTagsServer(limit = 4) {
  const cache = unstable_cache(
    async (limit = 4) => {
      const recentTags = await withQueryTimeout(
        () => db.query.tags.findMany({
          orderBy: [desc(tags.createdAt)],
          limit,
          columns: {
            id: true,
            slug: true,
            name: true,
            tier: true,
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
        createdAt: tag.createdAt?.toISOString() || new Date().toISOString(),
      }));
    },
    ["admin-recent-tags-v1"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-stats", "recent-tags"],
    }
  );

  return await cache(limit);
}

/**
 * Get detailed stock information for the production dashboard
 * Server Action - can safely import database
 * Cached for 5 minutes - detailed stock data with pagination
 */
export async function getDetailedStockServer(
  filterByTier: string | undefined,
  filterByClaimStatus: 'all' | 'claimed' | 'unclaimed' = 'all',
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  pageSize: number = 25,
  currentPage: number = 1,
  searchQuery: string = ''
) {
  const cache = unstable_cache(
    async (
      filterByTier: string | undefined,
      filterByClaimStatus: 'all' | 'claimed' | 'unclaimed',
      sortBy: string,
      sortOrder: 'asc' | 'desc',
      pageSize: number,
      currentPage: number,
      searchQuery: string
    ) => {
    // Build where conditions
    const conditions = [];

    if (filterByTier) {
      conditions.push(eq(tags.tier, filterByTier));
    }

    if (filterByClaimStatus === 'claimed') {
      conditions.push(isNotNull(tags.ownerId));
    } else if (filterByClaimStatus === 'unclaimed') {
      conditions.push(isNull(tags.ownerId));
    }

    if (searchQuery) {
      conditions.push(
        or(
          like(tags.slug, `%${searchQuery}%`),
          like(tags.name, `%${searchQuery}%`),
          like(tags.ownerId, `%${searchQuery}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column and order
    const sortByCreatedAt = sortBy === 'createdAt';
    const orderByDesc = sortOrder === 'desc';

    // Build single query with sort
    const items = await db.select({
      id: tags.id,
      slug: tags.slug,
      tier: tags.tier,
      status: tags.status,
      name: tags.name,
      ownerId: tags.ownerId,
      claimedAt: tags.claimedAt,
      createdAt: tags.createdAt,
    }).from(tags)
      .where(whereClause)
      .orderBy(sortByCreatedAt
        ? (orderByDesc ? desc(tags.createdAt) : asc(tags.createdAt))
        : (orderByDesc ? desc(tags.claimedAt) : asc(tags.claimedAt))
      )
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize);

    // Get total count
    let total = 0;
    if (whereClause) {
      const totalCount = await db.select({ count: count() }).from(tags).where(whereClause);
      total = typeof totalCount[0]?.count === 'number' ? totalCount[0].count : parseInt(totalCount[0]?.count as string || '0', 10);
    } else {
      total = await getTagsApproximateCount();
    }

      // Return minimal data to avoid large payloads
      return {
        items: items.map((item) => ({
          id: item.id,
          slug: item.slug,
          tier: item.tier,
          status: item.status,
          name: item.name,
          ownerId: item.ownerId,
          claimedAt: item.claimedAt ? item.claimedAt.toISOString() : null,
          createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
        })),
        total,
        pageSize,
        currentPage,
      };
    },
    ["admin-detailed-stock-v3"],
    {
      revalidate: 300, // 5 minutes
      tags: ["admin-stats", "stock-details"],
    }
  );

  return await cache(
    filterByTier,
    filterByClaimStatus,
    sortBy,
    sortOrder,
    pageSize,
    currentPage,
    searchQuery
  );
}

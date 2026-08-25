import { db } from "@/db";
import { stickerOrders, materialInventory } from "@/db/schema";
import { gte, lte, and, sql, eq } from "drizzle-orm";
import { withQueryTimeout } from "@/lib/postgres-utils";

export async function getRevenueStats(period: "daily" | "monthly" = "daily") {
  const stats = await getRevenueStatsBoth();
  return period === "daily" ? { ...stats.daily, period } : { ...stats.monthly, period };
}

/**
 * Daily & monthly paid-order revenue in ONE round trip.
 * Monthly range covers the daily range, so a single query from month start
 * with FILTER conditions replaces two separate queries.
 */
export async function getRevenueStatsBoth() {
  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  try {
    const rows = await withQueryTimeout(
      () =>
        db
          .select({
            dailyTotal: sql<number>`COALESCE(SUM(${stickerOrders.totalAmount}) FILTER (WHERE ${stickerOrders.createdAt} >= ${dayStart.toISOString()}::timestamptz), 0)`,
            dailyCount: sql<number>`COUNT(*) FILTER (WHERE ${stickerOrders.createdAt} >= ${dayStart.toISOString()}::timestamptz)`,
            monthlyTotal: sql<number>`COALESCE(SUM(${stickerOrders.totalAmount}), 0)`,
            monthlyCount: sql<number>`COUNT(*)`,
          })
          .from(stickerOrders)
          .where(
            and(
              eq(stickerOrders.paymentStatus, "paid"),
              gte(stickerOrders.createdAt, monthStart)
            )
          )
          .limit(1),
      null,
      5000
    );

    const row = rows?.[0];
    return {
      daily: {
        total: Number(row?.dailyTotal || 0),
        count: Number(row?.dailyCount || 0),
        period: "daily",
      },
      monthly: {
        total: Number(row?.monthlyTotal || 0),
        count: Number(row?.monthlyCount || 0),
        period: "monthly",
      },
    };
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return {
      daily: { total: 0, count: 0, period: "daily" },
      monthly: { total: 0, count: 0, period: "monthly" },
    };
  }
}

export async function getMaterialStockAlerts() {
  try {
    // Add timeout protection
    const materials = await withQueryTimeout(
      () => db.query.materialInventory.findMany({
        limit: 100, // Prevent large result sets
      }),
      [],
      5000
    );

    // Filter materials that are below low stock threshold
    const lowStockItems = materials.filter((m) => m.quantity <= m.lowStockThreshold);

    return {
      total: materials.length,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((m) => ({
        id: m.id,
        materialType: m.materialType,
        quantity: m.quantity,
        lowStockThreshold: m.lowStockThreshold,
        unit: m.unit,
      })),
    };
  } catch (error) {
    console.error('Error fetching material alerts:', error);
    // Return default values on error/timeout
    return {
      total: 0,
      lowStockCount: 0,
      lowStockItems: [],
    };
  }
}

export async function getDashboardStats() {
  // Run queries with timeout protection
  const [dailyRevenue, monthlyRevenue, materialAlerts] = await Promise.all([
    getRevenueStats("daily"),
    getRevenueStats("monthly"),
    getMaterialStockAlerts(),
  ]);

  return {
    revenue: {
      daily: dailyRevenue,
      monthly: monthlyRevenue,
    },
    materials: materialAlerts,
  };
}

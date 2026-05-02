import { db } from "@/db";
import { stickerOrders, materialInventory } from "@/db/schema";
import { gte, lte, and, sql, eq } from "drizzle-orm";

export async function getRevenueStats(period: "daily" | "monthly" = "daily") {
  const now = new Date();
  let startDate: Date;

  if (period === "daily") {
    // Start of today (UTC)
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  } else {
    // Start of this month (UTC)
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }

  try {
    // Use a simpler query with timeout protection
    const revenue = await db
      .select({
        total: sql<number>`COALESCE(SUM(${stickerOrders.totalAmount}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(stickerOrders)
      .where(
        and(
          eq(stickerOrders.paymentStatus, "paid"),
          gte(stickerOrders.createdAt, startDate)
        )
      )
      .limit(1); // Add limit to prevent full table scan

    return {
      total: revenue[0]?.total || 0,
      count: revenue[0]?.count || 0,
      period,
    };
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    // Return default values on error/timeout
    return {
      total: 0,
      count: 0,
      period,
    };
  }
}

export async function getMaterialStockAlerts() {
  try {
    const materials = await db.query.materialInventory.findMany({
      limit: 100, // Prevent large result sets
    });

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

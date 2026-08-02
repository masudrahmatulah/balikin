import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { user, tags, stickerOrders, scanLogs, userModuleSelections } from "@/db/schema";
import { count, eq, sql, desc, gte, lt, and } from "drizzle-orm";
import { subDays, subMonths, format } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Marketing Analytics API
 * GET /api/admin/marketing/analytics?timeRange=weekly
 *
 * Returns comprehensive marketing analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = await request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "weekly";

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "daily":
        startDate = subDays(now, 7);
        break;
      case "monthly":
        startDate = subMonths(now, 12);
        break;
      default: // weekly
        startDate = subDays(now, 28);
    }

    // Conversion Funnel Data
    const totalUsers = await db.select({ count: count() }).from(user);
    const usersWithTags = await db
      .select({ count: count() })
      .from(user)
      .innerJoin(tags, eq(user.id, tags.ownerId));
    const payingUsers = await db
      .select({ count: count() })
      .from(user)
      .innerJoin(stickerOrders, eq(user.id, stickerOrders.userId));

    const conversionFunnel = [
      {
        stage: "Total Users",
        count: totalUsers[0]?.count || 0,
        conversionRate: 100,
      },
      {
        stage: "Active Users",
        count: usersWithTags[0]?.count || 0,
        conversionRate: totalUsers[0]?.count
          ? ((usersWithTags[0]?.count || 0) / totalUsers[0]?.count) * 100
          : 0,
      },
      {
        stage: "Paying Users",
        count: payingUsers[0]?.count || 0,
        conversionRate: totalUsers[0]?.count
          ? ((payingUsers[0]?.count || 0) / totalUsers[0]?.count) * 100
          : 0,
      },
    ];

    // Module Performance Data
    const moduleStats = await db
      .select({
        module: userModuleSelections.moduleType,
        activations: count(),
        users: count(sql`DISTINCT ${userModuleSelections.userId}`),
      })
      .from(userModuleSelections)
      .groupBy(userModuleSelections.moduleType);

    const modulePerformance = moduleStats.map((stat) => ({
      module: stat.module || "None",
      activations: stat.activations,
      users: stat.users,
      revenue: 0, // Would calculate from actual sales
    }));

    // Finder to Buyer Data
    const recentScans = await db.query.scanLogs.findMany({
      where: gte(scanLogs.scannedAt, startDate),
      orderBy: [desc(scanLogs.scannedAt)],
    });

    const findersCount = recentScans.length;
    const newUsersFromScans = await db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, startDate));

    const finderToBuyer = [
      {
        period: timeRange === "daily" ? "Last 7 days" : timeRange === "monthly" ? "Last 12 months" : "Last 4 weeks",
        finders: findersCount,
        signups: newUsersFromScans[0]?.count || 0,
        conversionRate: findersCount > 0
          ? ((newUsersFromScans[0]?.count || 0) / findersCount) * 100
          : 0,
      },
    ];

    // Time Series Data
    let timeSeriesData: any[] = [];

    if (timeRange === "daily") {
      // Generate daily data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, "MMM dd");

        const newUsersData = await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, new Date(date.setHours(0, 0, 0, 0))),
              lt(user.createdAt, new Date(date.setHours(23, 59, 59, 999)))
            )
          );

        const conversionsData = await db
          .select({ count: count() })
          .from(stickerOrders)
          .where(
            and(
              gte(stickerOrders.createdAt, new Date(date.setHours(0, 0, 0, 0))),
              lt(stickerOrders.createdAt, new Date(date.setHours(23, 59, 59, 999)))
            )
          );

        timeSeriesData.push({
          date: dateStr,
          newUsers: newUsersData[0]?.count || 0,
          conversions: conversionsData[0]?.count || 0,
          revenue: 0, // Would calculate from actual orders
        });
      }
    } else if (timeRange === "weekly") {
      // Generate weekly data for last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = subDays(now, (i + 1) * 7);
        const weekEnd = subDays(now, i * 7);
        const weekStr = `Week ${4 - i}`;

        const newUsersData = await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, weekStart),
              lt(user.createdAt, weekEnd)
            )
          );

        const conversionsData = await db
          .select({ count: count() })
          .from(stickerOrders)
          .where(
            and(
              gte(stickerOrders.createdAt, weekStart),
              lt(stickerOrders.createdAt, weekEnd)
            )
          );

        timeSeriesData.push({
          date: weekStr,
          newUsers: newUsersData[0]?.count || 0,
          conversions: conversionsData[0]?.count || 0,
          revenue: 0,
        });
      }
    } else {
      // Generate monthly data for last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = subMonths(now, i + 1);
        const monthEnd = subMonths(now, i);
        const monthStr = format(monthStart, "MMM yyyy");

        const newUsersData = await db
          .select({ count: count() })
          .from(user)
          .where(
            and(
              gte(user.createdAt, monthStart),
              lt(user.createdAt, monthEnd)
            )
          );

        const conversionsData = await db
          .select({ count: count() })
          .from(stickerOrders)
          .where(
            and(
              gte(stickerOrders.createdAt, monthStart),
              lt(stickerOrders.createdAt, monthEnd)
            )
          );

        timeSeriesData.push({
          date: monthStr,
          newUsers: newUsersData[0]?.count || 0,
          conversions: conversionsData[0]?.count || 0,
          revenue: 0,
        });
      }
    }

    return NextResponse.json({
      conversionFunnel,
      modulePerformance,
      finderToBuyer,
      timeSeriesData,
    });
  } catch (error) {
    console.error(
      "Analytics API error:",
      error,
      "cause:",
      error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined
    );
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

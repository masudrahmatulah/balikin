import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { tags, stickerOrders } from "@/db/schema";
import { eq, sql, count, desc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Production Stock Stats API
 * GET /api/admin/production/stock-stats
 *
 * Returns real-time inventory statistics for production division
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin permission
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total produced tags
    const totalProduced = await db.select({ count: count() }).from(tags);

    // Get total claimed tags (tags with owners)
    const totalClaimed = await db
      .select({ count: count() })
      .from(tags)
      .where(sql`${tags.ownerId} IS NOT NULL`);

    // Get stats by product type
    const stickerTags = await db
      .select({ count: count(), claimed: count(tags.ownerId) })
      .from(tags)
      .where(eq(tags.tier, "sticker"));

    const acrylicTags = await db
      .select({ count: count(), claimed: count(tags.ownerId) })
      .from(tags)
      .where(eq(tags.tier, "premium"));

    // Bundle tags (tags that are part of bundles)
    const bundleTags = await db
      .select({ count: count(), claimed: count(tags.ownerId) })
      .from(tags)
      .where(sql`${tags.bundleId} IS NOT NULL`);

    const stats = {
      totalProduced: totalProduced[0]?.count || 0,
      totalClaimed: totalClaimed[0]?.count || 0,
      lowStockThreshold: 50, // Configurable threshold
      byType: {
        stickers: {
          produced: stickerTags[0]?.count || 0,
          claimed: stickerTags[0]?.claimed || 0,
        },
        acrylic: {
          produced: acrylicTags[0]?.count || 0,
          claimed: acrylicTags[0]?.claimed || 0,
        },
        bundles: {
          produced: bundleTags[0]?.count || 0,
          claimed: bundleTags[0]?.claimed || 0,
        },
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stock stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

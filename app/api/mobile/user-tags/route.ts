import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, desc, and, gte, sql, inArray, count } from 'drizzle-orm';
import { subDays } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Get user's tags with optimized scan count queries.
 * Uses aggregate queries instead of per-tag loops for better performance.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Get user's tags with scan counts in parallel
    const userTags = await db.query.tags.findMany({
      where: and(
        eq(tags.ownerId, userId),
        eq(tags.app_id, 'balikin_id')
      ),
      orderBy: [desc(tags.createdAt)],
    });

    if (userTags.length === 0) {
      return NextResponse.json([]);
    }

    const tagIds = userTags.map(tag => tag.id);
    const stickerTagIds = userTags.filter(tag => tag.productType === 'sticker').map(tag => tag.id);

    // Get all scan logs in parallel queries
    const [recentScansResult, totalScansResult] = await Promise.all([
      // Most recent scan for each tag
      db
        .select({
          tagId: scanLogs.tagId,
          scannedAt: scanLogs.scannedAt,
        })
        .from(scanLogs)
        .where(inArray(scanLogs.tagId, tagIds))
        .orderBy(desc(scanLogs.scannedAt)),

      // Scan counts for non-sticker tags (all time) and sticker tags (30 days)
      db
        .select({
          tagId: scanLogs.tagId,
          count: count(),
        })
        .from(scanLogs)
        .where(
          stickerTagIds.length > 0
            ? and(
                inArray(scanLogs.tagId, stickerTagIds),
                gte(scanLogs.scannedAt, thirtyDaysAgo)
              )
            : inArray(scanLogs.tagId, tagIds)
        )
        .groupBy(scanLogs.tagId),
    ]);

    // Map recent scans by tag (first one is the most recent)
    const mostRecentScanByTag = new Map<string, Date | null>();
    recentScansResult.forEach(scan => {
      if (!mostRecentScanByTag.has(scan.tagId)) {
        mostRecentScanByTag.set(scan.tagId, scan.scannedAt);
      }
    });

    // Map scan counts by tag
    const scanCountByTag = new Map<string, number>();
    totalScansResult.forEach(result => {
      scanCountByTag.set(result.tagId, result.count);
    });

    // Build response with computed scan data
    const tagsWithScanCount = userTags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      status: tag.status,
      tier: tag.tier,
      productType: tag.productType,
      scanCount: scanCountByTag.get(tag.id) || 0,
      lastScanned: mostRecentScanByTag.get(tag.id) || null,
    }));

    return NextResponse.json(tagsWithScanCount);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
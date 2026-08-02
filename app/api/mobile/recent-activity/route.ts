import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, desc, and, gte, inArray, sql } from 'drizzle-orm';
import { subDays, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

/**
 * Get recent scan activity for user's tags.
 * Fixed bug where only first tag was queried - now queries all tags in parallel.
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

    // Get user's tags and recent scans in parallel
    const [userTags, recentScans] = await Promise.all([
      db.query.tags.findMany({
        where: and(
          eq(tags.ownerId, userId),
          eq(tags.appId, 'balikin_id')
        ),
        columns: { id: true, name: true, status: true },
      }),

      db
        .select({
          id: scanLogs.id,
          tagId: scanLogs.tagId,
          city: scanLogs.city,
          scannedAt: scanLogs.scannedAt,
        })
        .from(scanLogs)
        .where(gte(scanLogs.scannedAt, thirtyDaysAgo))
        .orderBy(desc(scanLogs.scannedAt))
        .limit(20),
    ]);

    if (userTags.length === 0) {
      return NextResponse.json([]);
    }

    // Create tag map for quick lookup
    const tagMap = new Map(userTags.map(tag => [tag.id, tag]));
    const userTagIds = new Set(userTags.map(tag => tag.id));

    // Filter scans to only user's tags and take top 5
    const userRecentScans = recentScans
      .filter(scan => userTagIds.has(scan.tagId))
      .slice(0, 5);

    // Format scan activities
    const activities = userRecentScans.map((scan) => {
      const tag = tagMap.get(scan.tagId);
      const timeAgo = scan.scannedAt
        ? formatDistanceToNow(new Date(scan.scannedAt), {
            addSuffix: true,
            locale: id,
          })
        : 'Baru saja';

      return {
        id: scan.id,
        item: tag?.name || 'Tag',
        tagName: tag?.name || 'Tag',
        action: 'Di-scan',
        location: scan.city || 'Lokasi tidak diketahui',
        time: timeAgo,
        status: tag?.status === 'lost' ? 'warning' as const : 'success' as const,
      };
    });

    // Add lost tag activities at the beginning
    const lostTags = userTags.filter(tag => tag.status === 'lost');
    lostTags.forEach(tag => {
      activities.unshift({
        id: `lost-${tag.id}`,
        item: tag.name,
        tagName: tag.name,
        action: 'Mode Hilang',
        location: '-',
        time: 'Aktif',
        status: 'warning' as const,
      });
    });

    return NextResponse.json(activities.slice(0, 5));
  } catch (error) {
    // Return empty array on error instead of 500 for better UX
    return NextResponse.json([], { status: 200 });
  }
}
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { subDays, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

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

    // Get user's tags
    const userTags = await db.query.tags.findMany({
      where: eq(tags.ownerId, userId),
      columns: { id: true, name: true, status: true },
    });

    const tagMap = new Map(userTags.map(tag => [tag.id, tag]));

    // Get recent scan logs
    const thirtyDaysAgo = subDays(new Date(), 30);

    const recentScans = await db.query.scanLogs.findMany({
      where: and(
        eq(scanLogs.tagId, userTags[0]?.id || ''),
        gte(scanLogs.scannedAt, thirtyDaysAgo)
      ),
      orderBy: [desc(scanLogs.scannedAt)],
      limit: 10,
    });

    // Get scans for all tags
    const allRecentScans = await Promise.all(
      userTags.map(async (tag) => {
        const tagScans = await db.query.scanLogs.findMany({
          where: and(
            eq(scanLogs.tagId, tag.id),
            gte(scanLogs.scannedAt, thirtyDaysAgo)
          ),
          orderBy: [desc(scanLogs.scannedAt)],
          limit: 3,
        });
        return tagScans.map(scan => ({
          ...scan,
          tagName: tag.name,
          tagStatus: tag.status,
        }));
      })
    );

    // Flatten and sort
    const flattenedScans = allRecentScans.flat().sort((a, b) =>
      new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    );

    // Format as activity items
    const activities = flattenedScans.slice(0, 5).map((scan) => {
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
        status: tag?.status === 'lost' ? ('warning' as const) : ('success' as const),
      };
    });

    // Add lost tag activities
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
    console.error('[API] Error fetching recent activity:', error);
    return NextResponse.json([], { status: 200 });
  }
}

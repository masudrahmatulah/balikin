import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, desc, and, gte, inArray, count } from 'drizzle-orm';
import { subDays } from 'date-fns';
import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileHome } from '@/components/mobile/mobile-home';

interface TagData {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  productType: string | null;
  scanCount: number;
  lastScanned: Date | null;
}

interface StatsData {
  totalTags: number;
  totalScans: number;
  lostTags: number;
  returnRate: number;
  returnedItems: number;
}

interface ScanLog {
  id: string;
  tagName: string;
  action: string;
  location: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

async function getUserStats(userId: string): Promise<StatsData> {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [tagsResult, lostTagsResult, allUserTags] = await Promise.all([
      db.select({ count: count() }).from(tags).where(
        and(eq(tags.ownerId, userId), eq(tags.app_id, 'balikin_id'))
      ),
      db.select({ count: count() }).from(tags).where(
        and(
          eq(tags.ownerId, userId),
          eq(tags.app_id, 'balikin_id'),
          eq(tags.status, 'lost')
        )
      ),
      db.query.tags.findMany({
        where: and(
          eq(tags.ownerId, userId),
          eq(tags.app_id, 'balikin_id')
        ),
        columns: { id: true, productType: true },
      }),
    ]);

    const totalTags = tagsResult[0]?.count || 0;
    const lostTags = lostTagsResult[0]?.count || 0;

    const stickerTagIds = allUserTags
      .filter(tag => tag.productType === 'sticker')
      .map(tag => tag.id);

    const nonStickerTagIds = allUserTags
      .filter(tag => tag.productType !== 'sticker')
      .map(tag => tag.id);

    let totalScans = 0;

    if (stickerTagIds.length > 0) {
      const stickerScans = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(
          and(
            inArray(scanLogs.tagId, stickerTagIds),
            gte(scanLogs.scannedAt, thirtyDaysAgo)
          )
        );
      totalScans += stickerScans[0]?.count || 0;
    }

    if (nonStickerTagIds.length > 0) {
      const tagScans = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(inArray(scanLogs.tagId, nonStickerTagIds));
      totalScans += tagScans[0]?.count || 0;
    }

    const returnedItems = totalScans > 0 ? Math.floor(totalScans * 0.3) : 0;
    const returnRate = totalScans > 0 ? Math.min(98, Math.round((returnedItems / totalScans) * 100)) : 98;

    return { totalTags, totalScans, lostTags, returnedItems, returnRate };
  } catch {
    return { totalTags: 0, totalScans: 0, lostTags: 0, returnedItems: 0, returnRate: 98 };
  }
}

async function getUserTags(userId: string): Promise<TagData[]> {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const userTags = await db.query.tags.findMany({
      where: and(
        eq(tags.ownerId, userId),
        eq(tags.app_id, 'balikin_id')
      ),
      orderBy: [desc(tags.createdAt)],
    });

    if (userTags.length === 0) {
      return [];
    }

    const tagIds = userTags.map(tag => tag.id);
    const stickerTagIds = userTags.filter(tag => tag.productType === 'sticker').map(tag => tag.id);

    const [recentScansResult, totalScansResult] = await Promise.all([
      db
        .select({
          tagId: scanLogs.tagId,
          scannedAt: scanLogs.scannedAt,
        })
        .from(scanLogs)
        .where(inArray(scanLogs.tagId, tagIds))
        .orderBy(desc(scanLogs.scannedAt)),

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

    const mostRecentScanByTag = new Map<string, Date | null>();
    recentScansResult.forEach(scan => {
      if (!mostRecentScanByTag.has(scan.tagId)) {
        mostRecentScanByTag.set(scan.tagId, scan.scannedAt);
      }
    });

    const scanCountByTag = new Map<string, number>();
    totalScansResult.forEach(result => {
      scanCountByTag.set(result.tagId, result.count);
    });

    return userTags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      status: tag.status,
      tier: tag.tier,
      productType: tag.productType,
      scanCount: scanCountByTag.get(tag.id) || 0,
      lastScanned: mostRecentScanByTag.get(tag.id) || null,
    }));
  } catch {
    return [];
  }
}

async function getRecentActivity(userId: string): Promise<ScanLog[]> {
  try {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [userTags, recentScans] = await Promise.all([
      db.query.tags.findMany({
        where: and(
          eq(tags.ownerId, userId),
          eq(tags.app_id, 'balikin_id')
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
      return [];
    }

    const tagMap = new Map(userTags.map(tag => [tag.id, tag]));
    const userTagIds = new Set(userTags.map(tag => tag.id));

    const userRecentScans = recentScans
      .filter(scan => userTagIds.has(scan.tagId))
      .slice(0, 5);

    const activities = userRecentScans.map((scan) => {
      const tag = tagMap.get(scan.tagId);
      return {
        id: scan.id,
        tagName: tag?.name || 'Tag',
        action: 'Di-scan',
        location: scan.city || 'Lokasi tidak diketahui',
        time: scan.scannedAt ? `${Math.floor((Date.now() - scan.scannedAt.getTime()) / (1000 * 60))} menit yang lalu` : 'Baru saja',
        status: tag?.status === 'lost' ? ('warning' as const) : ('success' as const),
      };
    });

    const lostTags = userTags.filter(tag => tag.status === 'lost');
    lostTags.forEach(tag => {
      activities.unshift({
        id: `lost-${tag.id}`,
        tagName: tag.name,
        action: 'Mode Hilang',
        location: '-',
        time: 'Aktif',
        status: 'warning' as const,
      });
    });

    return activities.slice(0, 5);
  } catch {
    return [];
  }
}

export default async function MobilePage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const [stats, userTags, recentActivity] = await Promise.all([
    getUserStats(session.user.id),
    getUserTags(session.user.id),
    getRecentActivity(session.user.id),
  ]);

  return (
    <MobileLayout activeTab="home">
      <MobileHome
        initialStats={stats}
        initialTags={userTags}
        initialRecentActivity={recentActivity}
      />
    </MobileLayout>
  );
}

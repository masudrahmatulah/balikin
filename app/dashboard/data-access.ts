import { db } from '@/db';
import { tags, scanLogs, userModuleSelections } from '@/db/schema';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

const TAGS_CACHE_TTL = 300;
const MODULE_CACHE_TTL = 3600;

export async function getUserTags(userId: string) {
  return unstable_cache(
    async () => {
      return db.query.tags.findMany({
        where: eq(tags.ownerId, userId),
        orderBy: [desc(tags.createdAt)],
      });
    },
    [`user-tags-${userId}`],
    { revalidate: TAGS_CACHE_TTL, tags: [`user-${userId}`] }
  )();
}

export async function getUserModuleSelection(userId: string, moduleType: string) {
  return unstable_cache(
    async () => {
      return db.query.userModuleSelections.findFirst({
        where: and(
          eq(userModuleSelections.userId, userId),
          eq(userModuleSelections.moduleType, moduleType),
          eq(userModuleSelections.isActive, true)
        ),
      });
    },
    [`user-module-${userId}-${moduleType}`],
    { revalidate: MODULE_CACHE_TTL, tags: [`user-${userId}`] }
  )();
}

async function getTagScanCountsUncached(tagIds: string[]): Promise<Map<string, number>> {
  if (tagIds.length === 0) return new Map<string, number>();

  const result = await db
    .select({
      tagId: scanLogs.tagId,
      count: sql<number>`count(*)::int`,
    })
    .from(scanLogs)
    .where(inArray(scanLogs.tagId, tagIds))
    .groupBy(scanLogs.tagId);

  const counts = new Map<string, number>();
  result.forEach((row) => {
    counts.set(row.tagId, row.count);
  });

  return counts;
}

async function getTagScanCounts(tagIds: string[]): Promise<Map<string, number>> {
  const cacheKey = `scan-counts-${tagIds.sort().join('-')}`;

  return unstable_cache(
    async () => getTagScanCountsUncached(tagIds),
    [cacheKey],
    {
      revalidate: 300,
      tags: ['scan-counts']
    }
  )();
}

export async function getDashboardData(userId: string) {
  const [userTags, studentKitModule] = await Promise.all([
    getUserTags(userId),
    getUserModuleSelection(userId, 'student'),
  ]);

  const tagIds = userTags.map((t) => t.id);
  const scanCounts = await getTagScanCounts(tagIds);

  const tagsWithScanCount = userTags.map((tag) => ({
    ...tag,
    scanCount: scanCounts.get(tag.id) || 0,
    hasStudentKit: !!studentKitModule,
  }));

  return {
    tags: tagsWithScanCount,
    hasStudentKit: !!studentKitModule,
    freeTagCount: userTags.filter((tag) => tag.tier === 'free' || !tag.tier).length,
    lostTagCount: userTags.filter((tag) => tag.status === 'lost').length,
    totalScans: tagsWithScanCount.reduce((sum, tag) => sum + tag.scanCount, 0),
    hasPremiumTag: userTags.some((tag) => tag.tier === 'premium'),
  };
}
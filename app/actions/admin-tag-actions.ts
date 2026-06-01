'use server';

import { db } from '@/db';
import { tags, user, scanLogs } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { count, inArray } from 'drizzle-orm';

export interface TagWithOwner extends typeof tags.$inferSelect {
  owner: typeof user.$inferSelect | null;
  scanCount: number;
}

export async function getAllTagsForAdmin(): Promise<TagWithOwner[]> {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }

  const allTags = await db.query.tags.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    with: {
      owner: true,
    },
  });

  const tagIds = allTags.map((t) => t.id);
  const scanCounts = tagIds.length > 0
    ? await db
        .select({ tagId: scanLogs.tagId, count: count() })
        .from(scanLogs)
        .where(inArray(scanLogs.tagId, tagIds))
        .groupBy(scanLogs.tagId)
    : [];

  const scanCountMap = new Map(
    scanCounts.map((sc) => [sc.tagId as string, sc.count])
  );

  return allTags.map((tag) => ({
    ...tag,
    scanCount: scanCountMap.get(tag.id) || 0,
  }));
}

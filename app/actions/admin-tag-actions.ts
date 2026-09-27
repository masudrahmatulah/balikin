'use server';

import { db } from '@/db';
import { tags, user, scanLogs } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { and, count, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm';
import type { Tag } from '@/db/schema';

const ADMIN_TAGS_PAGE_SIZE = 25;
const UNCLAIMED_OWNER_VALUE = '__unclaimed__';

export interface TagWithOwner extends Tag {
  owner: {
    name: string | null;
    email: string;
  } | null;
  scanCount: number;
}

export interface AdminTagFilters {
  page?: number;
  search?: string;
  status?: 'all' | 'normal' | 'lost';
  ownerId?: string;
}

export interface AdminTagsResult {
  tags: TagWithOwner[];
  total: number;
  page: number;
  totalPages: number;
}

function buildTagWhere(filters: AdminTagFilters, ownerSearchIds: string[] = []) {
  const conditions = [eq(tags.app_id, 'balikin_id')];
  const search = filters.search?.trim();

  if (search) {
    const searchConditions = [ilike(tags.name, `%${search}%`), ilike(tags.slug, `%${search}%`)];
    if (ownerSearchIds.length > 0) {
      searchConditions.push(inArray(tags.ownerId, ownerSearchIds));
    }
    conditions.push(or(...searchConditions));
  }
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(tags.status, filters.status));
  }
  if (filters.ownerId === UNCLAIMED_OWNER_VALUE) {
    conditions.push(isNull(tags.ownerId));
  } else if (filters.ownerId && filters.ownerId !== 'all') {
    conditions.push(eq(tags.ownerId, filters.ownerId));
  }

  return and(...conditions);
}

export async function getTagsForAdmin(filters: AdminTagFilters = {}): Promise<AdminTagsResult> {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }

  const requestedPage = Number.isInteger(filters.page) && (filters.page as number) > 0 ? filters.page as number : 1;
  const search = filters.search?.trim();
  const ownerSearchIds = search
    ? (await db
        .select({ id: user.id })
        .from(user)
        .where(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))))
        .map((row) => row.id)
    : [];
  const where = buildTagWhere(filters, ownerSearchIds);
  const [{ total }] = await db.select({ total: count() }).from(tags).where(where);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_TAGS_PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const pageTags = await db.query.tags.findMany({
    where,
    orderBy: [desc(tags.createdAt)],
    with: {
      owner: true,
    },
    limit: ADMIN_TAGS_PAGE_SIZE,
    offset: (page - 1) * ADMIN_TAGS_PAGE_SIZE,
  });

  const tagIds = pageTags.map((t) => t.id);
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

  return {
    tags: pageTags.map((tag) => ({
    ...tag,
    scanCount: scanCountMap.get(tag.id) || 0,
    })),
    total,
    page,
    totalPages,
  };
}

export async function getTagOwnersForAdmin(): Promise<Array<{ id: string; name: string | null; email: string }>> {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }

  return db
    .selectDistinct({ id: user.id, name: user.name, email: user.email })
    .from(tags)
    .innerJoin(user, eq(tags.ownerId, user.id))
    .where(eq(tags.app_id, 'balikin_id'))
    .orderBy(desc(user.name));
}

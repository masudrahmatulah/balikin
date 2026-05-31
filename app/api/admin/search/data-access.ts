/**
 * Admin Search API Data Access Layer
 * Handles search queries with caching and multi-tenant filtering
 */

import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { user, tags, stickerOrders } from '@/db/schema';
import { and, eq, or, like, desc, sql } from 'drizzle-orm';

export interface SearchResult {
  type: 'user' | 'tag' | 'order';
  id: string;
  title: string;
  subtitle: string;
  href: string;
  relevance: number;
}

export interface SearchOptions {
  limit?: number;
  type?: 'user' | 'tag' | 'order' | 'all';
}

/**
 * Sanitize search query to prevent SQL injection and XSS
 */
function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim()
    .substring(0, 50);
}

/**
 * Validate search query format
 */
function isValidSearchQuery(query: string): boolean {
  const trimmed = query.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}

/**
 * Calculate search relevance score
 */
function calculateRelevance(query: string, field1: string | null, field2: string | null): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  if (field1?.toLowerCase() === lowerQuery) score += 100;
  else if (field1?.toLowerCase().startsWith(lowerQuery)) score += 50;
  else if (field1?.toLowerCase().includes(lowerQuery)) score += 20;

  if (field2?.toLowerCase() === lowerQuery) score += 80;
  else if (field2?.toLowerCase().startsWith(lowerQuery)) score += 40;
  else if (field2?.toLowerCase().includes(lowerQuery)) score += 15;

  return score;
}

/**
 * Search users with app_id filter
 */
async function searchUsers(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const results = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(
        and(
          eq(user.appId, 'balikin_id'),
          or(
            like(user.email, `%${query}%`),
            like(user.name, `%${query}%`)
          )
        )
      )
      .orderBy(desc(user.createdAt))
      .limit(limit);

    return results.map(u => ({
      type: 'user' as const,
      id: u.id,
      title: u.name || u.email,
      subtitle: u.email,
      href: `/admin/client/${u.id}`,
      relevance: calculateRelevance(query, u.email, u.name) + 10,
    }));
  } catch {
    return [];
  }
}

/**
 * Search tags with app_id filter
 */
async function searchTags(query: string, limit: number, isNanoid: boolean): Promise<SearchResult[]> {
  try {
    const results = await db
      .select({
        id: tags.id,
        slug: tags.slug,
        tier: tags.tier,
        status: tags.status,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .where(
        and(
          eq(tags.appId, 'balikin_id'),
          isNanoid ? eq(tags.slug, query) : like(tags.slug, `%${query}%`)
        )
      )
      .orderBy(desc(tags.createdAt))
      .limit(limit);

    return results.map(t => ({
      type: 'tag' as const,
      id: t.id,
      title: `Tag: ${t.slug}`,
      subtitle: `${t.tier} tier • ${t.status} status`,
      href: `/p/${t.slug}`,
      relevance: isNanoid ? 100 : calculateRelevance(query, t.slug, '') + 5,
    }));
  } catch {
    return [];
  }
}

/**
 * Search orders with app_id filter
 */
async function searchOrders(query: string, limit: number): Promise<SearchResult[]> {
  try {
    const results = await db
      .select({
        id: stickerOrders.id,
        status: stickerOrders.status,
        orderType: stickerOrders.orderType,
        totalAmount: stickerOrders.totalAmount,
        createdAt: stickerOrders.createdAt,
      })
      .from(stickerOrders)
      .where(
        and(
          eq(stickerOrders.appId, 'balikin_id'),
          like(stickerOrders.id, `%${query}%`)
        )
      )
      .orderBy(desc(stickerOrders.createdAt))
      .limit(limit);

    return results.map(o => ({
      type: 'order' as const,
      id: o.id,
      title: `Order: ${o.id}`,
      subtitle: `${o.orderType} • ${o.status} • Rp${o.totalAmount?.toLocaleString() || '0'}`,
      href: `/admin/sticker-orders`,
      relevance: calculateRelevance(query, o.id, ''),
    }));
  } catch {
    return [];
  }
}

/**
 * Global search with parallel queries and app_id filtering
 */
const cachedSearch = unstable_cache(
  async (query: string, options: SearchOptions = {}): Promise<SearchResult[]> => {
  const { limit = 20, type = 'all' } = options;

  if (!query || !isValidSearchQuery(query)) {
    return [];
  }

  const trimmedQuery = sanitizeSearchQuery(query);
  const isNanoid = /^[a-zA-Z0-9]{12}$/.test(trimmedQuery);

  const results: SearchResult[] = [];

  // Parallel search queries
  const promises: Promise<SearchResult[]>[] = [];

  if (type === 'all' || type === 'user') {
    promises.push(searchUsers(trimmedQuery, limit));
  }

  if (type === 'all' || type === 'tag') {
    promises.push(searchTags(trimmedQuery, limit, isNanoid));
  }

  if (type === 'all' || type === 'order') {
    promises.push(searchOrders(trimmedQuery, limit));
  }

  const settled = await Promise.allSettled(promises);

  for (const result of settled) {
    if (result.status === 'fulfilled') {
      results.push(...result.value);
    }
  }

  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
  },
  ['admin-search'],
  { revalidate: 300, tags: ['admin-search'] }
);

export async function cachedGlobalSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return cachedSearch(query, options);
}
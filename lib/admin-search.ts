/**
 * Global Search Functionality for Admin Dashboard
 * Provides unified search across users, tags, and orders
 */

import { db } from "@/db";
import { user, tags, stickerOrders } from "@/db/schema";
import { eq, or, like, desc, sql } from "drizzle-orm";

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
 * Removes dangerous characters and limits length
 */
function sanitizeSearchQuery(query: string): string {
  // Remove dangerous SQL characters
  let sanitized = query
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '')       // Remove SQL comments
    .replace(/\/\*/g, '')     // Remove block comment start
    .replace(/\*\//g, '');    // Remove block comment end

  // Limit length to prevent DoS
  return sanitized.trim().substring(0, 50);
}

/**
 * Validate search query format
 * Returns true if query is valid for search
 */
export function isValidSearchQuery(query: string): boolean {
  const trimmed = query.trim();
  // Reduced max length from 100 to 50 for security
  return trimmed.length >= 2 && trimmed.length <= 50;
}

/**
 * Global search across users, tags, and orders
 * Searches by email, name, or nanoid tag (12 characters)
 *
 * @param query - Search query (email, name, or nanoid)
 * @param options - Search options (limit, type filter)
 * @returns Array of search results sorted by relevance
 */
export async function globalSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { limit = 20, type = 'all' } = options;

  if (!query || !isValidSearchQuery(query)) {
    return [];
  }

  const trimmedQuery = sanitizeSearchQuery(query);
  const results: SearchResult[] = [];

  // Check if query is a nanoid (12 alphanumeric characters)
  const isNanoid = /^[a-zA-Z0-9]{12}$/.test(trimmedQuery);

  // Search users (if type is 'all' or 'user')
  if (type === 'all' || type === 'user') {
    try {
      const userResults = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          division: user.division,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(
          or(
            like(user.email, `%${trimmedQuery}%`),
            // FIXED: Use like() instead of sql template to prevent SQL injection
            like(user.name, `%${trimmedQuery}%`)
          )
        )
        .orderBy(desc(user.createdAt))
        .limit(limit);

      for (const u of userResults) {
        const relevance = calculateRelevance(trimmedQuery, u.email, u.name);
        results.push({
          type: 'user',
          id: u.id,
          title: u.name || u.email,
          subtitle: u.email,
          href: `/admin/client/${u.id}`,
          relevance: relevance + 10, // Boost users slightly
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }

  // Search tags (if type is 'all' or 'tag')
  if (type === 'all' || type === 'tag') {
    try {
      const tagResults = await db
        .select({
          id: tags.id,
          slug: tags.slug,
          ownerId: tags.ownerId,
          tier: tags.tier,
          status: tags.status,
          createdAt: tags.createdAt,
        })
        .from(tags)
        .where(
          isNanoid
            ? eq(tags.slug, trimmedQuery)
            : like(tags.slug, `%${trimmedQuery}%`)
        )
        .orderBy(desc(tags.createdAt))
        .limit(limit);

      for (const tag of tagResults) {
        const relevance = isNanoid ? 100 : calculateRelevance(trimmedQuery, tag.slug, '');
        results.push({
          type: 'tag',
          id: tag.id,
          title: `Tag: ${tag.slug}`,
          subtitle: `${tag.tier} tier • ${tag.status} status`,
          href: `/p/${tag.slug}`,
          relevance: relevance + 5, // Boost tags
        });
      }
    } catch (error) {
      console.error('Error searching tags:', error);
    }
  }

  // Search orders (if type is 'all' or 'order')
  if (type === 'all' || type === 'order') {
    try {
      const orderResults = await db
        .select({
          id: stickerOrders.id,
          userId: stickerOrders.userId,
          status: stickerOrders.status,
          orderType: stickerOrders.orderType,
          totalAmount: stickerOrders.totalAmount,
          createdAt: stickerOrders.createdAt,
        })
        .from(stickerOrders)
        .where(
          or(
            like(stickerOrders.id, `%${trimmedQuery}%`)
            // FIXED: Removed customerName field which doesn't exist in schema
            // and was using vulnerable sql template literal
          )
        )
        .orderBy(desc(stickerOrders.createdAt))
        .limit(limit);

      for (const order of orderResults) {
        const relevance = calculateRelevance(trimmedQuery, order.id, '');
        results.push({
          type: 'order',
          id: order.id,
          title: `Order: ${order.id}`,
          subtitle: `${order.orderType} • ${order.status} • Rp${order.totalAmount?.toLocaleString() || '0'}`,
          href: `/admin/sticker-orders`,
          relevance: relevance,
        });
      }
    } catch (error) {
      console.error('Error searching orders:', error);
    }
  }

  // Sort by relevance and limit results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * Calculate search relevance score
 * Higher score = better match
 */
function calculateRelevance(query: string, field1: string | null, field2: string | null): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Exact match in field 1
  if (field1?.toLowerCase() === lowerQuery) {
    score += 100;
  }
  // Starts with in field 1
  else if (field1?.toLowerCase().startsWith(lowerQuery)) {
    score += 50;
  }
  // Contains in field 1
  else if (field1?.toLowerCase().includes(lowerQuery)) {
    score += 20;
  }

  // Exact match in field 2
  if (field2?.toLowerCase() === lowerQuery) {
    score += 80;
  }
  // Starts with in field 2
  else if (field2?.toLowerCase().startsWith(lowerQuery)) {
    score += 40;
  }
  // Contains in field 2
  else if (field2?.toLowerCase().includes(lowerQuery)) {
    score += 15;
  }

  return score;
}

/**
 * Quick search for typeahead suggestions
 * Returns minimal data for faster autocomplete
 */
export async function quickSearch(
  query: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string; type: string }>> {
  const results = await globalSearch(query, { limit });
  return results.map(r => ({
    id: r.id,
    title: r.title,
    type: r.type,
  }));
}

/**
 * Search by specific types
 */
export async function searchUsers(query: string, limit = 10) {
  return globalSearch(query, { limit, type: 'user' });
}

export async function searchTags(query: string, limit = 10) {
  return globalSearch(query, { limit, type: 'tag' });
}

export async function searchOrders(query: string, limit = 10) {
  return globalSearch(query, { limit, type: 'order' });
}


/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(query: string) {
  if (!isValidSearchQuery(query)) {
    return [];
  }

  const results = await quickSearch(query, 5);

  // Group by type and return suggestions
  const suggestions = results.map(r => ({
    label: r.title,
    value: r.id,
    type: r.type,
  }));

  return suggestions;
}

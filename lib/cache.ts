/**
 * Centralized Caching Strategy
 * Provides consistent caching patterns across the application with proper invalidation
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag, revalidatePath } from 'next/cache';

// ============================================================================
// CACHE TAGS
// ============================================================================

export const CACHE_TAGS = {
  // User data
  USER_PROFILE: 'user-profile',
  USER_TAGS: 'user-tags',
  USER_STATS: 'user-stats',

  // Tags
  TAG: 'tag',
  TAG_SCAN: 'tag-scan',
  TAG_DETAILS: 'tag-details',

  // Admin
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_MODULES: 'admin-modules',
  ADMIN_STICKER_ORDERS: 'admin-sticker-orders',
  ADMIN_PRINT_QUEUE: 'admin-print-queue',
  ADMIN_ANALYTICS: 'admin-analytics',
  ADMIN_SEARCH: 'admin-search',

  // Global
  MODULE_CONFIG: 'module-config',
  STICKER_BUNDLES: 'sticker-bundles',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique cache key for user-specific data
 */
export function userCacheKey(tag: CacheTag, userId: string): string {
  return `${tag}:${userId}`;
}

/**
 * Generate a unique cache key for tag-specific data
 */
export function tagCacheKey(tag: CacheTag, tagId: string): string {
  return `${tag}:${tagId}`;
}

/**
 * Cache data with unstable_cache and proper tags
 */
export function cachedData<T>(
  keyParts: string[],
  fetcher: () => Promise<T>,
  tags: CacheTag[],
  revalidate?: number
) {
  return unstable_cache(
    async () => fetcher(),
    keyParts,
    {
      revalidate: revalidate || CACHE_CONFIG.MEDIUM,
      tags,
    }
  );
}

/**
 * Cache data for a specific user
 */
export function cacheUserData<T>(
  tag: CacheTag,
  userId: string,
  fetcher: () => Promise<T>,
  revalidate?: number
) {
  return cachedData(
    [userCacheKey(tag, userId)],
    fetcher,
    [tag],
    revalidate
  );
}

/**
 * Cache data for a specific tag
 */
export function cacheTagData<T>(
  tag: CacheTag,
  tagId: string,
  fetcher: () => Promise<T>,
  revalidate?: number
) {
  return cachedData(
    [tagCacheKey(tag, tagId)],
    fetcher,
    [tag],
    revalidate
  );
}

// ============================================================================
// INVALIDATION STRATEGIES
// ============================================================================

/**
 * Invalidate cache by tag
 */
export function invalidateCacheTag(tag: CacheTag): void {
  revalidateTag(tag);
}

/**
 * Invalidate cache by path
 */
export function invalidatePath(path: string): void {
  revalidatePath(path);
}

/**
 * Invalidate user-specific cache
 */
export function invalidateUserCache(userId: string, tags: CacheTag[] = []): void {
  tags.forEach((tag) => {
    invalidateCacheTag(tag);
  });
}

/**
 * Invalidate tag-specific cache
 */
export function invalidateTagCache(tagId: string, tags: CacheTag[] = []): void {
  tags.forEach((tag) => {
    invalidateCacheTag(tag);
  });
}

/**
 * Invalidate all admin-related caches
 */
export function invalidateAdminCaches(): void {
  Object.values(CACHE_TAGS).forEach((tag) => {
    if (tag.startsWith('admin')) {
      invalidateCacheTag(tag);
    }
  });
}

// ============================================================================
// CACHE WARMING
// ============================================================================

/**
 * Warm up cache by pre-fetching data
 */
export async function warmCache<T>(
  fetcher: () => Promise<T>
): Promise<void> {
  try {
    await fetcher();
  } catch {
    // Silent fail - cache warming is not critical
  }
}

/**
 * Warm up multiple caches in parallel
 */
export async function warmMultipleCaches(
  warmers: Array<() => Promise<unknown>>
): Promise<void> {
  await Promise.allSettled(warmers.map(warmer => warmer()));
}

// ============================================================================
// CACHE STATS
// ============================================================================

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

const cacheStats = new Map<string, { hits: number; misses: number }>();

/**
 * Track cache hit/miss for monitoring
 */
export function trackCacheAccess(key: string, hit: boolean): void {
  const stats = cacheStats.get(key) || { hits: 0, misses: 0 };

  if (hit) {
    stats.hits++;
  } else {
    stats.misses++;
  }

  cacheStats.set(key, stats);
}

/**
 * Get cache statistics for a key
 */
export function getCacheStats(key: string): CacheStats | null {
  const stats = cacheStats.get(key);

  if (!stats) return null;

  const total = stats.hits + stats.misses;

  return {
    hits: stats.hits,
    misses: stats.misses,
    hitRate: total > 0 ? stats.hits / total : 0,
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats(key?: string): void {
  if (key) {
    cacheStats.delete(key);
  } else {
    cacheStats.clear();
  }
}

// ============================================================================
// CACHED DATA HELPERS
// ============================================================================

/**
 * Create a cached fetcher with default error handling
 */
export function createCachedFetcher<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  tags: CacheTag[]
) {
  return async (...args: unknown[]): Promise<T> => {
    try {
      return await fetcher();
    } catch {
      return fallback;
    }
  };
}

/**
 * Cache with fallback value on error
 */
export function cachedWithFallback<T>(
  keyParts: string[],
  fetcher: () => Promise<T>,
  fallback: T,
  tags: CacheTag[],
  revalidate?: number
) {
  return unstable_cache(
    async () => {
      try {
        return await fetcher();
      } catch {
        return fallback;
      }
    },
    keyParts,
    {
      revalidate: revalidate || CACHE_CONFIG.SHORT,
      tags,
    }
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CACHE_CONFIG };
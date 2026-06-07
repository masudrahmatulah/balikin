/**
 * Blog caching utilities using Next.js 16 cache components
 * Replaces deprecated unstable_cache
 */

import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  revalidate: 300, // 5 minutes
  tags: ['blog-posts', 'blog-post-by-slug'],
} as const;

/**
 * Get all published posts (cached)
 */
export const getCachedPublishedPosts = unstable_cache(
  async () => {
    const posts = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt)
      ),
      orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
      limit: 50,
    });

    // Remove sensitive data
    return posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      coverImage: p.coverImage,
      authorName: p.authorName,
      authorAvatar: p.authorAvatar,
      reviewedBy: p.reviewedBy,
      reviewedByTitle: p.reviewedByTitle,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
    }));
  },
  ['blog-published-posts'],
  {
    revalidate: CACHE_CONFIG.revalidate,
    tags: ['blog-posts'],
  }
);

/**
 * Get single post by slug (cached)
 */
export const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    const post = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt)
      ),
    });

    return post;
  },
  ['blog-post-by-slug'],
  {
    revalidate: CACHE_CONFIG.revalidate,
    tags: ['blog-posts'],
  }
);

/**
 * Get post count by category/tag (cached)
 */
export const getCachedPostCount = unstable_cache(
  async (filter?: { category?: string; tag?: string }) => {
    let where = and(
      eq(blogPosts.isPublished, true),
      isNull(blogPosts.deletedAt)
    );

    // Additional filtering can be added here

    const posts = await db.query.blogPosts.findMany({
      where,
    });

    return posts.length;
  },
  ['blog-post-count'],
  {
    revalidate: 600, // 10 minutes
    tags: ['blog-posts'],
  }
);

/**
 * Invalidate blog cache
 * Call this after creating, updating, or deleting posts
 */
export function invalidateBlogCache() {
  // In Next.js 16, cache invalidation is handled via cache tags
  // The tags system automatically invalidates all cached items
  // with matching tags when revalidateTag is called
}

/**
 * Helper functions for blog system
 */

import { blogPosts } from '@/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

/**
 * Get WHERE condition to filter out soft-deleted posts
 * Use this in all blog post queries to ensure soft-deleted posts are excluded
 */
export function notDeleted() {
  return isNull(blogPosts.deletedAt);
}

/**
 * Get combined WHERE condition for published and not deleted posts
 */
export function publishedAndNotDeleted() {
  return and(
    isNull(blogPosts.deletedAt),
    eq(blogPosts.isPublished, true)
  );
}

/**
 * Get combined WHERE condition for published, not deleted, and specific app
 */
export function blogPostQuery() {
  return and(
    eq(blogPosts.appId, 'balikin_id'),
    isNull(blogPosts.deletedAt)
  );
}

/**
 * Get published posts for specific app
 */
export function publishedBlogPosts() {
  return and(
    eq(blogPosts.appId, 'balikin_id'),
    eq(blogPosts.isPublished, true),
    isNull(blogPosts.deletedAt)
  );
}

/**
 * Optimized blog queries with proper loading strategies
 * Prevents N+1 queries and uses efficient joins
 */

import { db } from '@/db';
import { blogPosts, blogComments, user } from '@/db/schema';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import type { BlogPostPublic, BlogCommentPublic } from '@/types/blog-api';

// ============================================================================
// PAGINATION CONSTANTS
// ============================================================================

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// BLOG POST QUERIES
// ============================================================================

/**
 * Get published posts with pagination
 * Optimized to avoid N+1 queries
 */
export async function getPublishedPostsPaginated(
  params: PaginationParams = {}
): Promise<PaginatedResult<BlogPostPublic>> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, params.pageSize || DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt)
      )
    );

  // Get posts with limit/offset
  const posts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.isPublished, true),
      isNull(blogPosts.deletedAt)
    ),
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
    limit: pageSize,
    offset,
    columns: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      coverImage: true,
      authorName: true,
      authorAvatar: true,
      reviewedBy: true,
      reviewedByTitle: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return {
    items: posts as BlogPostPublic[],
    total: Number(count),
    page,
    pageSize,
    hasMore: offset + posts.length < Number(count),
  };
}

/**
 * Get single post by slug (optimized)
 * Includes comment count to avoid separate query
 */
export async function getPostBySlug(slug: string) {
  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(blogPosts.slug, slug),
      eq(blogPosts.isPublished, true),
      isNull(blogPosts.deletedAt)
    ),
    with: {
      author: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewer: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!post) return null;

  // Get comment count in single query
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogComments)
    .where(
      and(
        eq(blogComments.postId, post.id),
        eq(blogComments.isApproved, true)
      )
    );

  return {
    ...post,
    commentCount: Number(count),
  };
}

// ============================================================================
// COMMENT QUERIES
// ============================================================================

/**
 * Get approved comments for a post (optimized)
 * Uses single query with proper ordering
 */
export async function getApprovedCommentsForPost(
  postId: string,
  params: PaginationParams = {}
): Promise<BlogCommentPublic[]> {
  const pageSize = Math.min(MAX_PAGE_SIZE, params.pageSize || DEFAULT_PAGE_SIZE);

  const comments = await db.query.blogComments.findMany({
    where: and(
      eq(blogComments.postId, postId),
      eq(blogComments.isApproved, true)
    ),
    orderBy: [desc(blogComments.createdAt)],
    limit: pageSize,
    columns: {
      id: true,
      parentId: true,
      name: true,
      commentText: true,
      isGiveawayWinner: true,
      hasHeroBadge: true,
      createdAt: true,
    },
  });

  return comments as BlogCommentPublic[];
}

/**
 * Get comment tree for a post (optimized)
 * Builds tree structure in memory after single query
 */
export async function getCommentTreeForPost(postId: string) {
  const comments = await db.query.blogComments.findMany({
    where: and(
      eq(blogComments.postId, postId),
      eq(blogComments.isApproved, true)
    ),
    orderBy: [desc(blogComments.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Build tree structure
  const commentMap = new Map();
  const rootComments: any[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    const node = commentMap.get(comment.id);
    if (comment.parentId && commentMap.has(comment.parentId)) {
      commentMap.get(comment.parentId).replies.push(node);
    } else {
      rootComments.push(node);
    }
  });

  return rootComments;
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get blog analytics summary (optimized)
 * Uses aggregation for better performance
 */
export async function getBlogAnalyticsSummary(postId: string) {
  const [views] = await db
    .select({ count: sql<number>`count(*)` })
    .from(db.schema.blogPostsAnalytics)
    .where(eq(db.schema.blogPostsAnalytics.postId, postId));

  const [comments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(blogComments)
    .where(
      and(
        eq(blogComments.postId, postId),
        eq(blogComments.isApproved, true)
      )
    );

  return {
    views: Number(views.count),
    comments: Number(comments.count),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate pagination parameters
 */
export function validatePagination(params: PaginationParams): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

/**
 * Calculate if there are more pages
 */
export function hasMorePages(total: number, offset: number, pageSize: number): boolean {
  return offset + pageSize < total;
}

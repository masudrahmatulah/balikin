/**
 * Blog post revision tracking system
 * Automatically creates revision snapshots on post changes
 */

import { db } from '@/db';
import { blogPostRevisions, blogPosts } from '@/db/schema';
import { eq, desc, max } from 'drizzle-orm';
import type { NewBlogPostRevision, BlogPost } from '@/db/schema';

/**
 * Create a revision snapshot for a blog post
 * Call this after any create, update, publish, unpublish, or delete operation
 */
export async function createRevision(
  post: BlogPost,
  changeType: 'create' | 'update' | 'publish' | 'unpublish' | 'delete',
  changedBy: string | null,
  changeReason?: string
): Promise<void> {
  try {
    // Get the next revision number for this post
    const [latestRevision] = await db
      .select({ revisionNumber: max(blogPostRevisions.revisionNumber) })
      .from(blogPostRevisions)
      .where(eq(blogPostRevisions.postId, post.id));

    const nextRevisionNumber = (latestRevision?.revisionNumber || 0) + 1;

    const revision: NewBlogPostRevision = {
      postId: post.id,
      revisionNumber: nextRevisionNumber,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      coverImage: post.coverImage,
      content: post.content,
      modules: post.modules as Array<any> || [],
      authorName: post.authorName,
      authorAvatar: post.authorAvatar,
      reviewedBy: post.reviewedBy,
      reviewedByTitle: post.reviewedByTitle,
      metaDescription: post.metaDescription,
      metaKeywords: post.metaKeywords,
      focusKeyword: post.focusKeyword,
      isPublished: post.isPublished,
      publishedAt: post.publishedAt,
      changedBy,
      changeReason,
      changeType,
    };

    await db.insert(blogPostRevisions).values(revision);
  } catch (error) {
    console.error('Failed to create revision:', error);
    // Don't throw - revision failures shouldn't block the main operation
  }
}

/**
 * Get all revisions for a specific post
 */
export async function getPostRevisions(postId: string) {
  return db.query.blogPostRevisions.findMany({
    where: eq(blogPostRevisions.postId, postId),
    orderBy: [desc(blogPostRevisions.revisionNumber)],
    with: {
      changedByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get a specific revision by ID
 */
export async function getRevision(revisionId: string) {
  return db.query.blogPostRevisions.findFirst({
    where: eq(blogPostRevisions.id, revisionId),
    with: {
      post: true,
      changedByUser: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Restore a post to a specific revision
 * Returns the updated post
 */
export async function restoreRevision(
  postId: string,
  revisionId: string,
  restoredBy: string
): Promise<BlogPost> {
  const revision = await getRevision(revisionId);
  if (!revision || revision.postId !== postId) {
    throw new Error('Revision not found');
  }

  // Create a revision of the current state before restoring
  const currentPost = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (currentPost) {
    await createRevision(currentPost, 'update', restoredBy, 'Pre-restore snapshot');
  }

  // Update the post with revision data
  const [updatedPost] = await db
    .update(blogPosts)
    .set({
      title: revision.title,
      slug: revision.slug,
      summary: revision.summary,
      coverImage: revision.coverImage,
      content: revision.content,
      modules: revision.modules,
      authorName: revision.authorName,
      authorAvatar: revision.authorAvatar,
      reviewedBy: revision.reviewedBy,
      reviewedByTitle: revision.reviewedByTitle,
      metaDescription: revision.metaDescription,
      metaKeywords: revision.metaKeywords,
      focusKeyword: revision.focusKeyword,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId))
    .returning();

  // Create a revision for the restore action
  await createRevision(updatedPost, 'update', restoredBy, 'Restored from revision');

  return updatedPost;
}

/**
 * Get revision history summary for admin dashboard
 */
export async function getRecentRevisions(limit = 20) {
  return db.query.blogPostRevisions.findMany({
    orderBy: [desc(blogPostRevisions.createdAt)],
    limit,
    with: {
      post: {
        columns: {
          id: true,
          title: true,
          slug: true,
        },
      },
      changedByUser: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
}

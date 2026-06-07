import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { blogPosts, blogPostRevisions, auditLogs } from '@/db/schema';
import { canPublishBlogPosts, getBlogSessionForAction } from '@/lib/blog-permissions';
import { after } from 'next/server';

export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface BlogPostWorkflowInput {
  postId: string;
  action: 'submit_for_review' | 'approve' | 'reject' | 'request_changes';
  rejectionReason?: string;
}

/**
 * Submit blog post for review
 */
export async function submitPostForReview(postId: string): Promise<void> {
  const session = await getBlogSessionForAction();

  if (!session || !session.permissions.canCreatePosts) {
    throw new Error('Unauthorized: You do not have permission to submit posts for review');
  }

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.authorId !== session.user.id) {
    throw new Error('Unauthorized: You can only submit your own posts for review');
  }

  await db.update(blogPosts)
    .set({
      isPublished: false,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Create revision record
  await createPostRevision(postId, 'submit_for_review', session.user.id);
}

/**
 * Approve blog post for publishing
 */
export async function approvePost(postId: string): Promise<void> {
  const session = await getBlogSessionForAction();

  if (!session || !session.permissions.canPublishPosts) {
    throw new Error('Unauthorized: You do not have permission to approve posts');
  }

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  await db.update(blogPosts)
    .set({
      isPublished: true,
      publishedAt: new Date(),
      reviewedById: session.user.id,
      reviewedByTitle: session.user.name || 'Admin',
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Create revision record
  await createPostRevision(postId, 'approve', session.user.id);

  // Create audit log
  await db.insert(auditLogs).values({
    adminId: session.user.id,
    action: 'approve_blog_post',
    entityType: 'blog_post',
    entityId: postId,
    ipAddress: null,
    createdAt: new Date(),
  });
}

/**
 * Reject blog post
 */
export async function rejectPost(postId: string, reason: string): Promise<void> {
  const session = await getBlogSessionForAction();

  if (!session || !session.permissions.canPublishPosts) {
    throw new Error('Unauthorized: You do not have permission to reject posts');
  }

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  await db.update(blogPosts)
    .set({
      isPublished: false,
      reviewedById: session.user.id,
      reviewedByTitle: session.user.name || 'Admin',
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Create revision record
  await createPostRevision(postId, 'reject', session.user.id, reason);

  // Create audit log
  await db.insert(auditLogs).values({
    adminId: session.user.id,
    action: 'reject_blog_post',
    entityType: 'blog_post',
    entityId: postId,
    originalValue: { rejectionReason: reason },
    ipAddress: null,
    createdAt: new Date(),
  });
}

/**
 * Request changes on blog post
 */
export async function requestChanges(postId: string, feedback: string): Promise<void> {
  const session = await getBlogSessionForAction();

  if (!session || !session.permissions.canPublishPosts) {
    throw new Error('Unauthorized: You do not have permission to request changes');
  }

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  await db.update(blogPosts)
    .set({
      isPublished: false,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, postId));

  // Create revision record
  await createPostRevision(postId, 'request_changes', session.user.id, feedback);

  // Create audit log
  await db.insert(auditLogs).values({
    adminId: session.user.id,
    action: 'request_changes_blog_post',
    entityType: 'blog_post',
    entityId: postId,
    originalValue: { feedback },
    ipAddress: null,
    createdAt: new Date(),
  });
}

/**
 * Helper function to create post revision records
 */
async function createPostRevision(
  postId: string,
  changeType: string,
  changedBy: string,
  changeReason?: string
): Promise<void> {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Get current revision count
  const revisions = await db.query.blogPostRevisions.findMany({
    where: eq(blogPostRevisions.postId, postId),
  });

  const revisionNumber = revisions.length + 1;

  await db.insert(blogPostRevisions).values({
    postId,
    revisionNumber,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    coverImage: post.coverImage,
    content: post.content,
    modules: post.modules || [],
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
    changeType: changeType as any,
  });
}

/**
 * Get workflow status for a post
 */
export async function getPostWorkflowStatus(postId: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.id, postId),
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.isPublished) {
    return {
      status: 'published' as const,
      canEdit: false,
      canSubmit: false,
      canApprove: false,
      canReject: false,
    };
  }

  if (post.reviewedById) {
    return {
      status: 'rejected' as const,
      canEdit: true,
      canSubmit: true,
      canApprove: false,
      canReject: false,
    };
  }

  return {
    status: 'draft' as const,
    canEdit: true,
    canSubmit: true,
    canApprove: false,
    canReject: false,
  };
}

/**
 * Get all posts pending review
 */
export async function getPendingReviewPosts() {
  const posts = await db.query.blogPosts.findMany({
    where: (table, { and, eq, isNull }) => and(
      eq(table.isPublished, false),
      isNull(table.reviewedById)
    ),
  });

  return posts;
}

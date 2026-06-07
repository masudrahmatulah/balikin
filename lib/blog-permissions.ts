import { cache } from 'react';
import { db } from '@/db';
import { user, blogPosts } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export interface BlogPermissions {
  canCreatePosts: boolean;
  canEditOwnPosts: boolean;
  canEditAnyPost: boolean;
  canPublishPosts: boolean;
  canModerateComments: boolean;
  canManageGiveaway: boolean;
  canReviewStories: boolean;
}

/**
 * Get the current session with blog permission checks
 */
async function getBlogSessionCore() {
  try {
    const headersList = await headers();

    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return null;
    }

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser) {
      return null;
    }

    // Admin has all permissions
    if (dbUser.role === 'admin') {
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: dbUser.role as "admin" | "editor" | "user",
          division: dbUser.division,
        },
        permissions: {
          canCreatePosts: true,
          canEditOwnPosts: true,
          canEditAnyPost: true,
          canPublishPosts: true,
          canModerateComments: true,
          canManageGiveaway: true,
          canReviewStories: true,
        },
      };
    }

    // Editor has granular permissions from blog_permissions field
    if (dbUser.role === 'editor') {
      const permissions = (dbUser.blogPermissions || {}) as BlogPermissions;

      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: dbUser.role as "editor",
          division: dbUser.division,
        },
        permissions: {
          canCreatePosts: permissions.canCreatePosts || false,
          canEditOwnPosts: permissions.canEditOwnPosts || false,
          canEditAnyPost: permissions.canEditAnyPost || false,
          canPublishPosts: permissions.canPublishPosts || false,
          canModerateComments: permissions.canModerateComments || false,
          canManageGiveaway: permissions.canManageGiveaway || false,
          canReviewStories: permissions.canReviewStories || false,
        },
      };
    }

    // Regular users have no blog permissions
    return null;
  } catch (error) {
    console.error('Error getting blog session:', error);
    return null;
  }
}

/**
 * Get blog session (cached)
 */
export const getBlogSession = cache(async () => {
  return getBlogSessionCore();
});

/**
 * Get blog session for server actions (non-cached)
 */
export async function getBlogSessionForAction() {
  return getBlogSessionCore();
}

/**
 * Check if current user can create blog posts
 */
export const canCreateBlogPosts = cache(async () => {
  const session = await getBlogSession();
  return session?.permissions.canCreatePosts || false;
});

/**
 * Check if current user can edit specific blog post
 */
export async function canEditBlogPost(postId: string): Promise<boolean> {
  const session = await getBlogSession();

  if (!session) {
    return false;
  }

  // Admin and editors with canEditAnyPost permission can edit any post
  if (session.user.role === 'admin' || session.permissions.canEditAnyPost) {
    return true;
  }

  // Editors with canEditOwnPosts can only edit their own posts
  if (session.permissions.canEditOwnPosts) {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId),
    });

    return post?.authorId === session.user.id;
  }

  return false;
}

/**
 * Check if current user can publish blog posts
 */
export const canPublishBlogPosts = cache(async () => {
  const session = await getBlogSession();
  return session?.permissions.canPublishPosts || false;
});

/**
 * Check if current user can moderate comments
 */
export const canModerateBlogComments = cache(async () => {
  const session = await getBlogSession();
  return session?.permissions.canModerateComments || false;
});

/**
 * Check if current user can manage giveaway claims
 */
export const canManageGiveaway = cache(async () => {
  const session = await getBlogSession();
  return session?.permissions.canManageGiveaway || false;
});

/**
 * Check if current user can review true stories
 */
export const canReviewTrueStories = cache(async () => {
  const session = await getBlogSession();
  return session?.permissions.canReviewStories || false;
});

/**
 * Authorization middleware for blog operations
 */
export function requireBlogPermission(permission: keyof BlogPermissions) {
  return async () => {
    const session = await getBlogSession();

    if (!session) {
      return false;
    }

    return session.permissions[permission] || false;
  };
}

/**
 * Get all users with blog permissions (admin only)
 */
export async function getBlogEditors() {
  return db.query.user.findMany({
    where: or(
      eq(user.role, 'admin'),
      eq(user.role, 'editor')
    ),
  });
}

/**
 * Update user blog permissions (admin only)
 */
export async function updateUserBlogPermissions(
  userId: string,
  permissions: Partial<BlogPermissions>
) {
  const existingUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // If user is not an editor, make them an editor
  if (existingUser.role !== 'admin' && existingUser.role !== 'editor') {
    await db.update(user)
      .set({ role: 'editor' })
      .where(eq(user.id, userId));
  }

  // Merge existing permissions with new ones
  const currentPermissions = (existingUser.blogPermissions || {}) as BlogPermissions;
  const updatedPermissions = { ...currentPermissions, ...permissions };

  await db.update(user)
    .set({ blogPermissions: updatedPermissions })
    .where(eq(user.id, userId));
}

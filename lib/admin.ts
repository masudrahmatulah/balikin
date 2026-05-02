import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { AuthenticationError, AuthorizationError, logError } from "@/lib/error-handler";

/**
 * Core admin session logic (shared between cached and non-cached versions)
 * Uses better-auth API for session, then queries database for role
 * because better-auth doesn't return custom fields like 'role' by default
 */
async function getAdminSessionCore() {
  try {
    const headersList = await headers();

    // Get session using better-auth API
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      logError(new AuthenticationError('No valid session found'), 'getAdminSession');
      return null;
    }

    // Query database to get the user's role (better-auth doesn't return custom fields)
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser) {
      logError(new AuthenticationError('User not found in database'), 'getAdminSession');
      return null;
    }

    if (dbUser.role !== 'admin') {
      logError(new AuthorizationError('User does not have admin role'), 'getAdminSession');
      return null;
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: dbUser.role as "admin",
      },
      session: {
        token: session.session?.id || 'unknown',
        expiresAt: session.session?.expiresAt || new Date(),
      }
    };
  } catch (error) {
    logError(error, 'getAdminSession');
    return null;
  }
}

/**
 * Get the current session with admin role check (cached)
 */
export const getAdminSession = cache(async () => {
  return getAdminSessionCore();
});

/**
 * Get admin session for use in server actions (non-cached)
 * Using cache() in server actions can cause serialization issues
 */
export async function getAdminSessionForAction() {
  return getAdminSessionCore();
}

/**
 * Check if current user is admin
 */
export const isAdmin = cache(async () => {
  const adminSession = await getAdminSession();
  return adminSession !== null;
});

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const users = await db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
  });
  return users;
}

/**
 * Get users with tag counts (optimized single query)
 */
export async function getUsersWithTagCounts(limit = 100) {
  const users = await db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    limit,
  });

  // Get tag counts in a single query using groupBy
  const tagCounts = await db
    .select({
      ownerId: tags.ownerId,
      count: count(),
    })
    .from(tags)
    .groupBy(tags.ownerId);

  // Create a map for quick lookup
  const tagCountMap = new Map(tagCounts.map((tc) => [tc.ownerId, tc.count]));

  // Combine users with their tag counts
  return users.map((user) => ({
    ...user,
    tagCount: tagCountMap.get(user.id) || 0,
  }));
}

/**
 * Get user by ID (admin only)
 */
export async function getUserById(userId: string) {
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  return userData;
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: "admin" | "user") {
  await db.update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

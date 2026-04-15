import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Get the current session with admin role check
 * Uses better-auth API for session, then queries database for role
 * because better-auth doesn't return custom fields like 'role' by default
 */
export const getAdminSession = cache(async () => {
  try {
    const headersList = await headers();

    // Get session using better-auth API
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return null;
    }

    // Query database to get the user's role (better-auth doesn't return custom fields)
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!dbUser || dbUser.role !== 'admin') {
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
    console.error('[getAdminSession] Error:', error instanceof Error ? error.message : String(error));
    return null;
  }
});

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
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });
  return users;
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

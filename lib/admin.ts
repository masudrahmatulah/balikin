import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Get the current session with admin role check
 * Uses better-auth API for consistency with the rest of the app
 */
export const getAdminSession = cache(async () => {
  try {
    // Use the same getSession logic as the dashboard
    const headersList = await headers();

    console.log('[getAdminSession] Checking admin session...');

    // Get session using better-auth API
    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log('[getAdminSession] Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: (session?.user as any)?.role,
    });

    if (!session?.user) {
      console.log('[getAdminSession] No session or user found');
      return null;
    }

    // Check if user has admin role
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      console.log('[getAdminSession] User is not admin, role:', userRole);
      return null;
    }

    console.log('[getAdminSession] Admin session confirmed for user:', session.user.id);

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: userRole as "admin",
      },
      session: {
        token: session.session?.id || 'unknown',
        expiresAt: session.session?.expiresAt || new Date(),
      }
    };
  } catch (error) {
    console.error('[getAdminSession] Error:', error);
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

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the current session with admin role check
 */
export const getAdminSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  // Fetch user with role from database
  const userWithRole = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!userWithRole || userWithRole.role !== "admin") {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: userWithRole.role as "admin",
    },
  };
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

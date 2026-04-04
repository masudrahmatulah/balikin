import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { user, session as sessionTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

/**
 * Get the current session with admin role check
 * Updated to work with manual auth implementation
 */
export const getAdminSession = cache(async () => {
  // Read session cookie directly
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  // Find session from database
  const sessionRecord = await db
    .select({
      session: sessionTable,
      user: user,
    })
    .from(sessionTable)
    .innerJoin(user, eq(sessionTable.userId, user.id))
    .where(eq(sessionTable.token, sessionToken))
    .limit(1);

  if (!sessionRecord.length) {
    return null;
  }

  const sessionData = sessionRecord[0];

  // Check if session is expired
  if (new Date(sessionData.session.expiresAt) < new Date()) {
    await db.delete(sessionTable).where(eq(sessionTable.token, sessionToken));
    return null;
  }

  // Check if user has admin role
  if (!sessionData.user || sessionData.user.role !== "admin") {
    return null;
  }

  return {
    user: {
      id: sessionData.user.id,
      email: sessionData.user.email,
      name: sessionData.user.name,
      role: sessionData.user.role as "admin",
    },
    session: {
      token: sessionData.session.token,
      expiresAt: sessionData.session.expiresAt,
    }
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

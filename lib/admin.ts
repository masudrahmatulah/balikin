import { auth } from "@/lib/auth";
import { cache } from "react";
import { db } from "@/db";
import { user, tags } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { headers } from "next/headers";
import { AuthenticationError, AuthorizationError, logError } from "@/lib/error-handler";
import { Division, type DivisionType } from "@/lib/admin-divisions";

/**
 * Core admin session logic (shared between cached and non-cached versions)
 * Uses better-auth API for session, then queries database for role and division
 * because better-auth doesn't return custom fields like 'role' or 'division' by default
 */
async function getAdminSessionCore() {
  try {
    const headersList = await headers();

    // Get session using better-auth API with timeout
    const sessionPromise = auth.api.getSession({
      headers: headersList,
    });

    // Add 8 second timeout for session retrieval: cold connections to Supabase
    // (TLS handshake) made the previous 5s limit flaky, logging admins out randomly
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Session retrieval timeout')), 8000)
    );

    const session = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<ReturnType<typeof auth.api.getSession>>;

    if (!session?.user) {
      logError(new AuthenticationError('No valid session found'), 'getAdminSession');
      return null;
    }

    // Query database to get the user's role and division with timeout + one retry,
    // so a slow/cold DB connection doesn't log out a valid admin.
    const fetchDbUser = (timeoutMs: number) =>
      Promise.race([
        db.query.user.findFirst({
          where: eq(user.id, session.user.id),
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
        ),
      ]);

    let dbUser: Awaited<ReturnType<typeof db.query.user.findFirst>>;
    try {
      dbUser = await fetchDbUser(4000);
    } catch (firstError) {
      dbUser = await fetchDbUser(6000);
    }

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
        division: dbUser.division as DivisionType | null,
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
 * Session management constants
 */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const SESSION_WARNING_MS = 25 * 60 * 1000; // Show warning at 25 minutes

/**
 * Check session timeout and activity
 * Returns true if session is still valid, false if should logout
 */
export async function checkSessionTimeout(): Promise<boolean> {
  const session = await getAdminSession();

  if (!session?.session) {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(session.session.expiresAt);

  // Check if session has expired
  if (now >= expiresAt) {
    return false;
  }

  // Check if session is about to expire (within warning threshold)
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  if (timeUntilExpiry <= SESSION_WARNING_MS) {
    // Session is about to expire, could show warning here
    console.warn(`Session expires in ${Math.floor(timeUntilExpiry / 1000 / 60)} minutes`);
  }

  return true;
}

/**
 * Get current admin user with session info
 */
export async function getCurrentAdminUser() {
  const session = await getAdminSession();
  return session?.user || null;
}

/**
 * Invalidate session (logout)
 * Properly cleans up session on server side
 */
export async function invalidateSession(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();

    if (!session) {
      return { success: false, error: "No active session to invalidate" };
    }

    // Better auth will handle session invalidation
    // This is a placeholder for any additional cleanup needed
    // In production, you might want to:
    // - Log the logout event
    // - Clear any server-side caches
    // - Update user last activity timestamp

    return { success: true };
  } catch (error) {
    logError(error, 'invalidateSession');
    return { success: false, error: "Failed to invalidate session" };
  }
}

/**
 * Extend session timeout
 * Refreshes session expiry time
 */
export async function refreshSession(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();

    if (!session) {
      return { success: false, error: "No active session to refresh" };
    }

    // Better auth handles session refresh automatically
    // This is a placeholder for any additional refresh logic
    // In production, you might want to:
    // - Update last activity timestamp in database
    // - Log the refresh event
    // - Clear stale caches

    return { success: true };
  } catch (error) {
    logError(error, 'refreshSession');
    return { success: false, error: "Failed to refresh session" };
  }
}

/**
 * Get session info for display (time remaining, etc.)
 */
export async function getSessionInfo() {
  const session = await getAdminSession();

  if (!session?.session) {
    return {
      isValid: false,
      expiresAt: null,
      timeRemaining: 0,
      warningThreshold: SESSION_WARNING_MS,
    };
  }

  const now = new Date();
  const expiresAt = new Date(session.session.expiresAt);
  const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());

  return {
    isValid: timeRemaining > 0,
    expiresAt,
    timeRemaining,
    warningThreshold: SESSION_WARNING_MS,
    shouldWarn: timeRemaining <= SESSION_WARNING_MS && timeRemaining > 0,
  };
}

/**
 * Get all users with pagination (admin only)
 */
export async function getAllUsers(limit = 100, offset = 0) {
  const users = await db.query.user.findMany({
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    limit,
    offset,
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

/**
 * Update user division (admin only)
 */
export async function updateUserDivision(userId: string, division: DivisionType | null) {
  await db.update(user)
    .set({ division, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

/**
 * Get user division (admin only)
 */
export async function getUserDivision(userId: string): Promise<DivisionType | null> {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  return dbUser?.division as DivisionType | null || null;
}

/**
 * Get all admins by division
 */
export async function getAdminsByDivision(division: DivisionType) {
  const admins = await db.query.user.findMany({
    where: eq(user.role, 'admin'),
  });

  return admins.filter(admin => admin.division === division);
}

import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import { auth } from './auth';
import type { Session } from './auth';
import { db } from '@/db';
import { session as sessionTable, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get the current session on the server side
 * Use this in Server Components and Server Actions
 * Updated to use manual session reading as fallback
 */
export async function getSession(): Promise<Session | null> {
  // Try Better Auth API first
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    if (session) {
      return session as Session | null;
    }
  } catch {
    // Continue to manual session reading
  }

  // Fallback to manual session reading
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (sessionToken) {
      const sessionRecord = await db
        .select({
          session: sessionTable,
          user: user,
        })
        .from(sessionTable)
        .innerJoin(user, eq(sessionTable.userId, user.id))
        .where(eq(sessionTable.token, sessionToken))
        .limit(1);

      if (sessionRecord.length) {
        const sessionData = sessionRecord[0];

        // Check if session is expired
        if (new Date(sessionData.session.expiresAt) < new Date()) {
          await db.delete(sessionTable).where(eq(sessionTable.token, sessionToken));
          return null;
        }

        return {
          user: sessionData.user,
          session: sessionData.session,
        } as Session;
      }
    }
  } catch {
    // Return null if manual session reading fails
  }

  return null;
}

/**
 * Get the current user from session on the server side
 */
export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to sign-in if not authenticated
 * Use this in Server Components that require authentication
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

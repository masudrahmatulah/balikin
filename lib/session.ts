import { headers } from 'next/headers';
import { auth } from './auth';
import type { Session } from './auth';

/**
 * Get the current session on the server side
 * Use this in Server Components and Server Actions
 */
export async function getSession(): Promise<Session | null> {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });
    return session as Session | null;
  } catch {
    return null;
  }
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

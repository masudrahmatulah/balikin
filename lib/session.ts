import { headers } from 'next/headers';
import { auth } from './auth';
import type { Session } from './auth';
import { cookies } from 'next/headers';

/**
 * Get the current session on the server side
 * Use this in Server Components and Server Actions
 */
export async function getSession(): Promise<Session | null> {
  try {
    // Next.js 16 requires await for headers()
    const headersList = await headers();

    // Debug: Check if session cookie exists
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('better-auth.session_token');
    console.log('[getSession] Session cookie exists:', !!sessionCookie);

    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log('[getSession] Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: (session?.user as any)?.role,
    });

    return session as Session | null;
  } catch (error) {
    console.error('[getSession] Error:', error);
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

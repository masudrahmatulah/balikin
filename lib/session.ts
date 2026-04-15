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
    const allCookies = cookieStore.getAll();

    console.log('[getSession] All cookies:', allCookies.map(c => c.name));
    const sessionCookie = cookieStore.get('better-auth.session_token');
    console.log('[getSession] Session cookie:', sessionCookie ? {
      exists: true,
      value: sessionCookie.value.slice(0, 20) + '...',
      // @ts-ignore
      domain: sessionCookie.domain,
      // @ts-ignore
      path: sessionCookie.path,
    } : 'MISSING');

    console.log('[getSession] Calling auth.api.getSession...');

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
    console.error('[getSession] Error stack:', error instanceof Error ? error.stack : 'No stack');
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

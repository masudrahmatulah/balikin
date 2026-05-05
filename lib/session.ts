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
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // Debug logging to help identify session issues
    if (!session) {
      console.warn('[getSession] ❌ No session found');
      console.warn('[getSession] Possible causes:');
      console.warn('[getSession]  - User not authenticated');
      console.warn('[getSession]  - Session expired');
      console.warn('[getSession]  - Cookie not being sent');
      console.warn('[getSession] Suggestions: Complete OTP verification or check /api/auth/debug');
    } else {
      console.log('[getSession] ✅ Session found for user:', session.user?.email);
      console.log('[getSession] Session ID:', session.session?.id);
      console.log('[getSession] Expires at:', session.session?.expiresAt);
    }

    return session as Session | null;
  } catch (error) {
    console.error('[getSession] ❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('[getSession] Error stack:', error.stack);
    }
    console.error('[getSession] Suggestions: Check /api/auth/debug for diagnostics');
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

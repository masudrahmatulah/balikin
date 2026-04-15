import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * Debug endpoint to check session state
 * GET /api/auth/debug/session
 *
 * This helps debug why session validation might be failing by showing:
 * - What cookies are received
 * - What session is found
 * - Any validation errors
 */
export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Log for server-side debugging
  console.log('[DEBUG SESSION] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.slice(0, 20) })));
  console.log('[DEBUG SESSION] Session cookie exists:', !!cookieStore.get('better-auth.session_token'));
  console.log('[DEBUG SESSION] Session cookie value:', cookieStore.get('better-auth.session_token')?.value?.slice(0, 20));

  try {
    // Try to get session using the current request headers
    const session = await auth.api.getSession({
      headers: new Headers({
        cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; ')
      })
    });

    console.log('[DEBUG SESSION] Session found:', !!session);
    console.log('[DEBUG SESSION] Session user:', session?.user?.id);

    return NextResponse.json({
      success: true,
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        sessionToken: allCookies.find(c => c.name === 'better-auth.session_token')?.value?.slice(0, 30) + '...' || null,
        sessionCookie: allCookies.find(c => c.name === 'better-auth.session_token') ? {
          name: allCookies.find(c => c.name === 'better-auth.session_token')!.name,
          value: allCookies.find(c => c.name === 'better-auth.session_token')!.value?.slice(0, 50) + '...',
          // @ts-ignore - some cookies have additional properties
          domain: allCookies.find(c => c.name === 'better-auth.session_token')?.domain,
          // @ts-ignore
          path: allCookies.find(c => c.name === 'better-auth.session_token')?.path,
          // @ts-ignore
          secure: allCookies.find(c => c.name === 'better-auth.session_token')?.secure,
          // @ts-ignore
          sameSite: allCookies.find(c => c.name === 'better-auth.session_token')?.sameSite,
        } : null,
      },
      session: session ? {
        exists: true,
        userId: session.user?.id,
        userEmail: session.user?.email,
        userRole: (session.user as any)?.role,
        sessionId: session.session?.id,
      } : {
        exists: false,
        reason: 'Session not found in database or token invalid'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        betterAuthUrl: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'not set',
      },
      error: null
    });
  } catch (error: any) {
    console.error('[DEBUG SESSION] Error:', error);

    return NextResponse.json({
      success: false,
      cookies: {
        count: allCookies.length,
        names: allCookies.map(c => c.name),
        sessionToken: allCookies.find(c => c.name === 'better-auth.session_token')?.value?.slice(0, 30) + '...' || null,
      },
      session: {
        exists: false,
        reason: 'Exception during session validation',
      },
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      },
    }, { status: 500 });
  }
}

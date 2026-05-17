import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";

/**
 * Test endpoint to verify session and cookie status
 * GET /api/auth/test-session
 *
 * Returns detailed information about:
 * - Current session
 * - Cookies received
 * - Database user data
 */
export async function GET() {
  try {
    // Get all cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieSummary = allCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...', // Truncate for security
    }));

    console.log('[TEST-SESSION] Cookies received:', cookieSummary);

    // Get session using Better Auth
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    console.log('[TEST-SESSION] Session result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'No active session found',
        cookies: cookieSummary,
        session: null,
      });
    }

    // Get user from database
    const { db } = await import("@/db");
    const { user } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    return NextResponse.json({
      success: true,
      message: 'Active session found',
      cookies: cookieSummary,
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        division: dbUser.division,
      } : null,
    });
  } catch (error: any) {
    console.error('[TEST-SESSION] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    }, { status: 500 });
  }
}
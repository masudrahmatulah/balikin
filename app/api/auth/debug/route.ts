import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Comprehensive Authentication Debug Endpoint
 * GET /api/auth/debug
 *
 * Returns detailed information about the current authentication state
 * including session data, user info, database role, and any issues found.
 */
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // No valid session found
    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        session: null,
        user: null,
        database: null,
        isAdmin: false,
        issues: ['No valid session found - user may not be authenticated'],
        suggestions: [
          'Complete OTP verification process',
          'Check browser console for authentication errors',
          'Verify cookies are enabled in browser',
          'Try logging out and signing in again'
        ]
      }, { status: 200 });
    }

    // Check database for user role
    let dbUser = null;
    let dbError = null;

    try {
      dbUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
      });
    } catch (error) {
      dbError = error instanceof Error ? error.message : String(error);
      console.error('[AUTH-DEBUG] Database query error:', error);
    }

    // Check for issues
    const issues = [];
    const suggestions = [];

    if (!dbUser) {
      issues.push('User not found in database');
      suggestions.push('User session exists but database record is missing');
      suggestions.push('Try recreating your account');
    } else if (dbUser.role !== 'admin') {
      issues.push(`User does not have admin role (current role: ${dbUser.role})`);
      suggestions.push('Run: npm run make-admin ' + session.user.email);
      suggestions.push('Contact administrator to request admin access');
    }

    // Check session expiration
    const sessionExpiresAt = session.session?.expiresAt;
    const isExpired = sessionExpiresAt && new Date(sessionExpiresAt) < new Date();

    if (isExpired) {
      issues.push('Session has expired');
      suggestions.push('Complete OTP verification again to create a new session');
    }

    // Return comprehensive debug information
    return NextResponse.json({
      authenticated: true,
      session: {
        id: session.session?.id || 'unknown',
        expiresAt: sessionExpiresAt,
        isExpired: isExpired,
        token: session.session?.token || 'unknown'
      },
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
      database: {
        found: !!dbUser,
        user: dbUser ? {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
        } : null,
        error: dbError
      },
      isAdmin: dbUser?.role === 'admin',
      issues: issues.length > 0 ? issues : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      success: issues.length === 0
    }, { status: 200 });

  } catch (error: any) {
    console.error('[AUTH-DEBUG] Unexpected error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error.message || 'An unexpected error occurred',
      issues: ['Debug endpoint failed'],
      suggestions: ['Check server logs for details', 'Verify database connection']
    }, { status: 500 });
  }
}
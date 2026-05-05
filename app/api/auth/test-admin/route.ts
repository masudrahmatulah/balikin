import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";

/**
 * Test Admin Access Endpoint
 * GET /api/auth/test-admin
 *
 * Tests if the current user has admin access by attempting to get an admin session.
 * Returns detailed information about admin access status.
 */
export async function GET() {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return NextResponse.json({
        hasAdminAccess: false,
        adminSession: null,
        issues: ['Admin session could not be established'],
        suggestions: [
          'Verify you are authenticated as an admin user',
          'Check /api/auth/debug for detailed authentication status',
          'Ensure your user role in database is set to "admin"',
          'Run: npm run check-user your-email@example.com'
        ]
      }, { status: 200 });
    }

    return NextResponse.json({
      hasAdminAccess: true,
      adminSession: {
        user: {
          id: adminSession.user.id,
          email: adminSession.user.email,
          name: adminSession.user.name,
          role: adminSession.user.role,
        },
        session: {
          token: adminSession.session.token,
          expiresAt: adminSession.session.expiresAt,
        }
      },
      issues: undefined,
      success: true
    }, { status: 200 });

  } catch (error: any) {
    console.error('[TEST-ADMIN] Error:', error);
    return NextResponse.json({
      hasAdminAccess: false,
      error: error.message || String(error),
      issues: ['Admin access test failed with exception'],
      suggestions: [
        'Check server logs for error details',
        'Verify database connection',
        'Ensure Better Auth is properly configured'
      ]
    }, { status: 500 });
  }
}
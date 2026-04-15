import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Debug endpoint to check user role from different sources
 * GET /api/auth/debug/user-role
 *
 * This helps debug why admin role might not be detected by comparing:
 * 1. Session user from better-auth API
 * 2. Direct database query for the user
 */
export async function GET() {
  try {
    // Get session from better-auth
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'No authenticated user found',
        session: session,
      });
    }

    // Get user directly from database
    const dbUser = await db.query.user.findFirst({
      where: eq(user.email, session.user.email),
    });

    return NextResponse.json({
      sessionUser: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        // Check ALL properties to see what's available
        allKeys: Object.keys(session.user),
        allProperties: session.user,
        role: (session.user as any)?.role,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
      databaseUser: dbUser ? {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
      } : null,
      comparison: {
        roleMatches: dbUser && (session.user as any)?.role === dbUser.role,
        sessionRole: (session.user as any)?.role,
        dbRole: dbUser?.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

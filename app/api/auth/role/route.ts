import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get current user's role from database
 * GET /api/auth/role
 *
 * Returns the role field from the database since better-auth
 * doesn't return custom fields by default
 */
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({
        error: 'No authenticated user',
      }, { status: 401 });
    }

    // Get user from database to get the role field
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        role: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({
        error: 'User not found in database',
      }, { status: 404 });
    }

    return NextResponse.json({
      userId: session.user.id,
      email: session.user.email,
      role: dbUser.role,
      isAdmin: dbUser.role === 'admin',
    });
  } catch (error: any) {
    console.error('[API/ROLE] Error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
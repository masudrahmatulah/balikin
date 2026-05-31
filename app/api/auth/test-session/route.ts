import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { cookies } from "next/headers";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieSummary = allCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...',
    }));

    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'No active session found',
        cookies: cookieSummary,
        session: null,
      });
    }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error && process.env.NODE_ENV !== 'production'
      ? error.stack
      : undefined;

    return NextResponse.json({
      success: false,
      error: message,
      stack,
    }, { status: 500 });
  }
}
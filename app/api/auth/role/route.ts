import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const dbUser = await db.query.user.findFirst({
      where: and(eq(user.id, session.user.id), eq(user.app_id, 'balikin_id')),
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: message,
    }, { status: 500 });
  }
}

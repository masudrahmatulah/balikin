import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { session, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Find session
    const sessionRecord = await db
      .select({
        session: session,
        user: user,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.token, sessionToken))
      .limit(1);

    if (!sessionRecord.length) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const sessionData = sessionRecord[0];

    // Check if session is expired
    if (new Date(sessionData.session.expiresAt) < new Date()) {
      await db.delete(session).where(eq(session.token, sessionToken));
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role,
      }
    });
  } catch (error: any) {
    console.error("Error getting session:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

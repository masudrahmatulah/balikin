import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Use Better Auth's getSession API for proper session validation
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ session: null, user: null }, { status: 200 });
    }

    return NextResponse.json({
      session: session,
      user: session.user,
    });
  } catch (error: any) {
    console.error("[GET-SESSION] Error:", error);
    return NextResponse.json({ session: null, user: null }, { status: 200 });
  }
}

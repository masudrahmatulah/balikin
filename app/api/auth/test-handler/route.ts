import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { auth } = await import("@/lib/auth");
    return NextResponse.json({
      message: "Auth import successful",
      authExists: !!auth,
      authType: typeof auth
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error && process.env.NODE_ENV !== 'production'
      ? error.stack
      : undefined;

    return NextResponse.json({
      message: "Auth import failed",
      error: message,
      stack
    }, { status: 500 });
  }
}
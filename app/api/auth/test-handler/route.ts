import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test importing auth
    const { auth } = await import("@/lib/auth");
    return NextResponse.json({
      message: "Auth import successful",
      authExists: !!auth,
      authType: typeof auth
    });
  } catch (error: any) {
    return NextResponse.json({
      message: "Auth import failed",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

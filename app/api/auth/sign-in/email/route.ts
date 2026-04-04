import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, session, verification } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, callbackURL } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Check if OTP exists and is valid
    const now = new Date();
    const verificationRecord = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          eq(verification.value, otp)
        )
      )
      .limit(1);

    if (!verificationRecord.length) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const record = verificationRecord[0];

    // Check if OTP is expired
    if (new Date(record.expiresAt) < now) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Find or create user
    let existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    let userId: string;

    if (!existingUser.length) {
      // Create new user
      const newUserId = crypto.randomUUID();
      const newUser = await db
        .insert(user)
        .values({
          id: newUserId,
          email,
          emailVerified: true,
        })
        .returning();

      userId = newUser[0].id;
    } else {
      userId = existingUser[0].id;
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(session).values({
      id: crypto.randomUUID(),
      userId,
      token: sessionToken,
      expiresAt,
    });

    // Delete used OTP
    await db
      .delete(verification)
      .where(eq(verification.id, record.id));

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: { id: userId, email },
      redirect: callbackURL || "/dashboard"
    });

    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
      sameSite: "lax"
    });

    return response;
  } catch (error: any) {
    console.error("Error signing in:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign in" },
      { status: 500 }
    );
  }
}

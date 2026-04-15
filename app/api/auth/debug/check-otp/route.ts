import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Debug endpoint to check OTP in database
 * GET /api/auth/debug/check-otp?identifier=email@example.com
 *
 * This helps debug why OTP validation might be failing by showing
 * what's actually stored in the database.
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      error: 'This endpoint is only available in development mode',
    }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!identifier) {
    return NextResponse.json({
      error: 'Missing identifier parameter',
      usage: 'GET /api/auth/debug/check-otp?identifier=email@example.com',
    }, { status: 400 });
  }

  try {
    // Get current OTP records for this identifier
    const now = new Date();
    const otpRecords = await db
      .select({
        id: verification.id,
        identifier: verification.identifier,
        value: verification.value,
        expiresAt: verification.expiresAt,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
      })
      .from(verification)
      .where(
        and(
          eq(verification.identifier, identifier),
          gt(verification.expiresAt, now) // Only non-expired
        )
      )
      .orderBy(verification.createdAt);

    // Also get ALL records (including expired) for debugging
    const allRecords = await db
      .select({
        id: verification.id,
        identifier: verification.identifier,
        value: verification.value,
        expiresAt: verification.expiresAt,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
      })
      .from(verification)
      .where(eq(verification.identifier, identifier))
      .orderBy(verification.createdAt);

    const nowMs = Date.now();

    return NextResponse.json({
      debug: {
        identifier,
        currentTime: now.toISOString(),
        currentTimeMs: nowMs,
      },
      validOTP: otpRecords.map(record => ({
        ...record,
        expiresAt: record.expiresAt.toISOString(),
        createdAt: (record.createdAt ?? new Date()).toISOString(),
        updatedAt: (record.updatedAt ?? new Date()).toISOString(),
        isExpired: new Date(record.expiresAt).getTime() < nowMs,
        timeUntilExpiry: new Date(record.expiresAt).getTime() - nowMs,
      })),
      allOTP: allRecords.map(record => ({
        ...record,
        expiresAt: record.expiresAt.toISOString(),
        createdAt: (record.createdAt ?? new Date()).toISOString(),
        updatedAt: (record.updatedAt ?? new Date()).toISOString(),
        isExpired: new Date(record.expiresAt).getTime() < nowMs,
        timeUntilExpiry: new Date(record.expiresAt).getTime() - nowMs,
      })),
      message: otpRecords.length === 0
        ? 'No valid OTP found for this identifier. Check if OTP has expired or if identifier is correct.'
        : `Found ${otpRecords.length} valid OTP(s) for this identifier.`,
    });
  } catch (error: any) {
    console.error('[DEBUG CHECK-OTP] Error:', error);
    return NextResponse.json({
      error: 'Failed to check OTP',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Debug Endpoint untuk melihat OTP terakhir di Preview Environment
 * Hanya works di development/preview, bukan production
 */
export async function GET(request: Request) {
  // Security: Only allow in preview/development
  const isProduction = process.env.NODE_ENV === 'production' &&
                       process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    return NextResponse.json(
      { error: 'Debug endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    // Next.js 16: Use nextUrl for proper async searchParams handling
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Get latest OTP for this email
    const otpRecords = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email))
      .orderBy(desc(verification.createdAt))
      .limit(5);

    if (otpRecords.length === 0) {
      return NextResponse.json({
        message: 'No OTP records found for this email',
        email,
        tip: 'Make sure you have requested an OTP first'
      });
    }

    // Return latest OTP info
    const latest = otpRecords[0];
    return NextResponse.json({
      email: latest.identifier,
      otp: latest.code,
      createdAt: latest.createdAt,
      expiresAt: latest.expiresAt,
      allRecords: otpRecords.map(r => ({
        code: r.code,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt
      })),
      usage: 'Use this OTP code to complete authentication',
      warning: 'This endpoint is only available in preview/development environment'
    });

  } catch (error) {
    console.error('[DEBUG OTP] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch OTP',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
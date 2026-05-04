import { NextResponse } from 'next/server';
import { db } from '@/db';
import { verification, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Comprehensive OTP troubleshooting endpoint for preview/development
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
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        message: 'Email parameter required',
        usage: '/api/debug/test-otp?email=your-email@example.com',
        example: '/api/debug/test-otp?email=masudrahmatullah@gmail.com'
      });
    }

    // Check if user exists
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    // Get all OTP records for this email (case-insensitive)
    const allOtpRecords = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email.toLowerCase()))
      .orderBy(desc(verification.createdAt))
      .limit(10);

    return NextResponse.json({
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        betterAuthUrl: process.env.BETTER_AUTH_URL,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      },
      userCheck: {
        email: email.toLowerCase(),
        userExists: users.length > 0,
        userInfo: users.length > 0 ? {
          id: users[0].id,
          email: users[0].email,
          name: users[0].name,
          role: users[0].role,
          createdAt: users[0].createdAt
        } : null
      },
      otpRecords: {
        email: email.toLowerCase(),
        totalRecords: allOtpRecords.length,
        records: allOtpRecords.map(r => ({
          code: r.code,
          createdAt: r.createdAt,
          expiresAt: r.expiresAt,
          age: r.createdAt ? `${Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 1000)} seconds ago` : 'Unknown'
        }))
      },
      instructions: {
        noRecords: allOtpRecords.length === 0 ? [
          "❌ No OTP records found",
          "1. Make sure you've requested an OTP first",
          "2. Check if you're using the correct email address",
          "3. Try requesting a new OTP",
          "4. Check browser console for errors"
        ] : [],
        hasRecords: allOtpRecords.length > 0 ? [
          "✅ OTP records found!",
          `Latest OTP: ${allOtpRecords[0].code}`,
          `Expires: ${allOtpRecords[0].expiresAt}`,
          `Age: ${allOtpRecords[0].createdAt ? Math.floor((Date.now() - new Date(allOtpRecords[0].createdAt).getTime()) / 1000) : 0} seconds ago`,
          "Use this OTP code to complete authentication"
        ] : []
      }
    });

  } catch (error) {
    console.error('[DEBUG TEST-OTP] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to troubleshoot OTP',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
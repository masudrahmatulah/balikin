import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Simple test endpoint to verify better-auth is working
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    return NextResponse.json({
      status: 'ok',
      message: 'Better-auth API is responding',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        betterAuthUrl: process.env.BETTER_AUTH_URL,
        nextPublicBetterAuthUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
        nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
      authConfig: {
        hasAPI: !!auth.api,
        hasEmailOTP: true,
      },
      requestInfo: {
        origin: url.origin,
        host: url.host,
        pathname: url.pathname,
      },
      instructions: {
        nextSteps: [
          "1. If this endpoint works, better-auth is configured correctly",
          "2. Try accessing /api/auth/get-session to test session retrieval",
          "3. Check browser console for client-side errors",
          "4. Test sign-in flow at /sign-in"
        ]
      }
    });

  } catch (error) {
    console.error('[TEST-AUTH] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
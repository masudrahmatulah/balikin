import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Debug endpoint to verify environment configuration and test email sending
 * GET /api/auth/debug
 * GET /api/auth/debug?test=true to send a test email
 */
export async function GET(request: NextRequest) {
  // Environment info (safe to expose)
  const env = {
    nodeEnv: process.env.NODE_ENV,
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyPrefix: process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.slice(0, 10)}...` : 'NOT SET',
    emailFrom: process.env.EMAIL_FROM || 'NOT SET',
    forceSendEmail: process.env.FORCE_SEND_EMAIL || 'NOT SET',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'NOT SET',
    timestamp: new Date().toISOString(),
  };

  const searchParams = request.nextUrl.searchParams;
  const testEmail = searchParams.get('test') === 'true';

  if (testEmail) {
    // Test email sending
    try {
      const { sendOTPEmail } = await import("@/lib/email");
      const testOtp = '000000';
      const testEmailAddress = 'masudrahmatullah@gmail.com';

      await sendOTPEmail({
        email: testEmailAddress,
        otp: testOtp,
        type: 'sign-in',
      });

      return NextResponse.json({
        success: true,
        env,
        message: `Test email sent to ${testEmailAddress} with OTP ${testOtp}. Check your inbox!`,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        env,
        message: 'Failed to send test email',
        error: error.message,
        stack: error.stack,
      }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    env,
    message: 'Environment check passed. Add ?test=true to send a test email.',
  });
}

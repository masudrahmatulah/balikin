import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { user, session, account, verification } from "@/db/schema";

/**
 * Helper function to check if an identifier is a WhatsApp number
 * WhatsApp numbers are stored with "@wa.dev" suffix to pass email validation
 */
function isWhatsAppIdentifier(email: string): boolean {
  return email.endsWith('@wa.dev');
}

/**
 * Extract phone number from WhatsApp identifier
 */
function extractPhoneNumber(email: string): string {
  return email.replace(/@wa\.dev$/, '');
}

/**
 * Unified OTP sender that routes to Email or WhatsApp based on identifier
 */
async function sendOTP({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: string;
}) {
  const startTime = Date.now();

  try {
    // Debug logging at entry
    console.log('[AUTH SERVICE] 🚀 sendOTP called:', {
      email,
      type,
      hasApiKey: !!process.env.RESEND_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });

    if (isWhatsAppIdentifier(email)) {
      // Route to WhatsApp OTP
      const phoneNumber = extractPhoneNumber(email);
      console.log('[AUTH SERVICE] 📱 Sending WhatsApp OTP:', {
        phoneNumber,
        type,
        timestamp: new Date().toISOString(),
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[WHATSAPP AUTH OTP] type=${type} phone=${phoneNumber} otp=${otp}`);
      }

      await sendWhatsAppOTP({
        phoneNumber,
        otp,
        type: type as 'sign-in' | 'email-verification' | 'forget-password',
      });

      const duration = Date.now() - startTime;
      console.log('[AUTH SERVICE] ✅ WhatsApp OTP sent successfully:', { duration: `${duration}ms` });
    } else {
      // Route to Email OTP
      console.log('[AUTH SERVICE] 📧 About to call sendOTPEmail:', {
        email,
        otp,
        type,
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[EMAIL AUTH OTP] type=${type} email=${email} otp=${otp}`);
      }

      await sendOTPEmail({
        email,
        otp,
        type: type as 'sign-in' | 'email-verification' | 'forget-password',
      });

      console.log('[AUTH SERVICE] ✅ sendOTPEmail returned successfully');

      const duration = Date.now() - startTime;
      console.log('[AUTH SERVICE] ✅ Email OTP sent successfully:', { duration: `${duration}ms` });
    }
  } catch (error) {
    console.error('[AUTH SERVICE] ❌ ERROR sending OTP:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      email,
      type,
    });
    throw error; // Re-throw to ensure better-auth sees the error
  }
}

/**
 * Main Auth Instance
 * Handles both Email and WhatsApp OTP authentication
 */
export const auth = betterAuth({
  // Base URL is required for origin validation
  // Support localhost:3000, localhost:3001, and dynamic detection via environment
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  appName: "Balikin",
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // 1 day - update session age
    // Enable cookie cache for better performance and reliability
    // Session data is cached in cookie with validation against database
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days - same as session expiration
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    // Configure cookie settings for devtunnel compatibility
    cookiePrefix: 'better-auth',
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Configure SameSite for better cross-origin handling
    sameSite: 'lax',
  },
  // Allow requests from localhost, devtunnel, and production domains
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://balikin.masudrahmat.my.id',
    'https://balikin-ten.vercel.app',
    'https://*.vercel.app',
    'https://*.euw.devtunnels.ms',
    'https://*.devtunnels.ms',
  ],
  // Allow redirect URLs
  allowedRedirectURLs: [
    'http://localhost:3000',
    'http://localhost:3000/**',
    'http://localhost:3001',
    'http://localhost:3001/**',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3000/**',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3001/**',
    'https://balikin.masudrahmat.my.id',
    'https://balikin.masudrahmat.my.id/**',
    'https://balikin-ten.vercel.app',
    'https://balikin-ten.vercel.app/**',
    'https://*.vercel.app',
    'https://*.vercel.app/**',
    'https://*.euw.devtunnels.ms',
    'https://*.euw.devtunnels.ms/**',
    'https://*.devtunnels.ms',
    'https://*.devtunnels.ms/**',
  ],
  // Verification configuration - store in plain text for WhatsApp support
  verification: {
    storeIdentifier: "plain", // Use plain text instead of hashed (for @wa.dev support)
    storeInDatabase: true, // Store OTPs in database
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        try {
          console.log('[BETTER_AUTH] sendVerificationOTP callback called:', { email, type });
          await sendOTP({ email, otp, type });
          console.log('[BETTER_AUTH] sendVerificationOTP completed successfully');
        } catch (error) {
          console.error('[BETTER_AUTH] ❌ sendVerificationOTP failed:', error);
          throw error;
        }
      },
      expiresIn: 5 * 60, // 5 minutes in seconds
      allowedAttempts: 3,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

// Export helpers for use in components
export { isWhatsAppIdentifier, extractPhoneNumber };

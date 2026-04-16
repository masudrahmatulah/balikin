import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { user, session, account, verification } from "@/db/schema";

/**
 * Google OAuth Configuration
 * Credentials should be set in environment variables:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 */
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (process.env.NODE_ENV !== 'production' && !googleClientId) {
  console.warn('[AUTH] GOOGLE_CLIENT_ID not set - Google SSO will not work');
}
if (process.env.NODE_ENV !== 'production' && !googleClientSecret) {
  console.warn('[AUTH] GOOGLE_CLIENT_SECRET not set - Google SSO will not work');
}

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
    if (isWhatsAppIdentifier(email)) {
      // Route to WhatsApp OTP
      const phoneNumber = extractPhoneNumber(email);

      await sendWhatsAppOTP({
        phoneNumber,
        otp,
        type: type as 'sign-in' | 'email-verification' | 'forget-password',
      });
    } else {
      // Route to Email OTP
      await sendOTPEmail({
        email,
        otp,
        type: type as 'sign-in' | 'email-verification' | 'forget-password',
      });
    }
  } catch (error) {
    // Log error without exposing sensitive email/OTP
    console.error('[AUTH SERVICE] ERROR sending OTP:', {
      error: error instanceof Error ? error.message : String(error),
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
  // Use environment variable in production, localhost for development
  // For Vercel deployments, BETTER_AUTH_URL should be set to the production domain
  baseURL: process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://balikin.online' : 'http://localhost:3000'),
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
  user: {
    additionalFields: {
      // Define app_id field that exists in database schema
      app_id: {
        type: "string",
        defaultValue: "balikin_id",
      },
      // Define role field that exists in database schema
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // 1 day - update session age
    // Enable cookie cache for better performance
    // Session data is cached in cookie with validation against database
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days - same as session expiration
    },
  },
  // Account linking configuration - Critical for Google SSO to work with existing OTP users
  account: {
    accountLinking: {
      enabled: true,
      // Allow linking between different auth methods (OTP, WhatsApp, Google)
      // This is essential for users who signed up with OTP/WhatsApp and want to link Google account
      trustedProviders: ["google"],
      // Allow linking with different email addresses to handle normalization differences
      // This prevents unable_to_link_account error due to email case/symbol mismatches
      allowDifferentEmails: true,
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
    // Add explicit cookie attributes for production
    cookieAttributes: {
      domain: process.env.NODE_ENV === 'production' ? '.balikin.online' : undefined,
      path: '/',
    },
    // Hooks for handling user creation and account linking
    hooks: {
      // Before user creation - normalize email and set default values
      before: async (event) => {
        console.log('[AUTH] BEFORE hook:', {
          type: event.type,
          hasData: !!event.data,
          hasUser: !!event.data?.user,
          email: event.data?.user?.email,
        });

        // Normalize email for sign-in and sign-up events only
        // Avoid modifying social login data to prevent conflicts
        if (
          (event.type === 'sign_in' || event.type === 'sign_up') &&
          event.data?.user?.email
        ) {
          const email = event.data.user.email;
          // Simple normalization: just lowercase and trim
          // Don't remove Gmail dots as it can cause conflicts with OAuth providers
          const normalizedEmail = email.toLowerCase().trim();

          console.log('[AUTH] Normalizing email:', {
            original: email,
            normalized: normalizedEmail,
          });
          event.data.user.email = normalizedEmail;
        }
      },
      // After user creation - link account and set defaults
      after: async (event) => {
        console.log('[AUTH] AFTER hook:', {
          type: event.type,
          hasUser: !!event.user,
          userId: event.user?.id,
          email: event.user?.email,
          name: event.user?.name,
        });

        if (event.type === 'sign_up' || event.type === 'sign_in') {
          const user = event.user;
          if (user) {
            console.log('[AUTH] User authenticated successfully:', {
              id: user.id,
              email: user.email,
              name: user.name,
              type: event.type,
            });
          }
        }
      },
    },
  },
  // Allow requests from localhost, devtunnel, and production domains
  trustedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'https://balikin.online',
    'https://www.balikin.online',
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
    'https://balikin.online',
    'https://balikin.online/**',
    'https://www.balikin.online',
    'https://www.balikin.online/**',
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
  // Social providers for SSO (Google)
  socialProviders: googleClientId && googleClientSecret ? {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      enabled: true,
    },
  } : undefined,
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        try {
          await sendOTP({ email, otp, type });
        } catch (error) {
          console.error('[BETTER_AUTH] sendVerificationOTP failed:', error);
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

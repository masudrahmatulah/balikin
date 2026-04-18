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
  // Account linking configuration - Disabled temporarily for testing
  account: {
    accountLinking: {
      enabled: false, // Disabled to allow new user registration with Google SSO
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
  },
  // Enable Better Auth logger for debugging
  logger: {
    enabled: true,
    level: process.env.NODE_ENV === 'production' ? "error" : "debug", // Debug di local, error-only di production
  },
  // Database hooks for handling user creation
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log('[AUTH] Creating user:', {
            email: user.email,
            name: user.name,
          });

          // Normalize email for all auth methods
          if (user.email) {
            user.email = user.email.toLowerCase().trim();
          }

          return {
            data: user,
          };
        },
        after: async (user) => {
          console.log('[AUTH] User created successfully:', {
            id: user.id,
            email: user.email,
            name: user.name,
            app_id: user.app_id,
            role: user.role,
          });
        },
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
  socialProviders: {
    google: {
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
    },
  },
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

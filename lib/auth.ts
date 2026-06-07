import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { user, session, account, verification } from "@/db/schema";

// ============================================================================
// CONSTANTS
// ============================================================================

const WHATSAPP_DOMAIN = '@wa.dev';
const DEFAULT_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://balikin.online'
  : 'http://localhost:3000';

const TRUSTED_ORIGINS = new Set([
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
]);

const ALLOWED_REDIRECT_URLS = new Set([
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
]);

const OTP_EXPIRY_SECONDS = 5 * 60;
const OTP_MAX_ATTEMPTS = 3;
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SECONDS = 24 * 60 * 60;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isWhatsAppIdentifier(email: string): boolean {
  return email.endsWith(WHATSAPP_DOMAIN);
}

function extractPhoneNumber(email: string): string {
  return email.replace(new RegExp(`${WHATSAPP_DOMAIN}$`), '');
}

async function sendOTP({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: string;
}): Promise<void> {
  if (isWhatsAppIdentifier(email)) {
    const phoneNumber = extractPhoneNumber(email);
    await sendWhatsAppOTP({
      phoneNumber,
      otp,
      type: type as 'sign-in' | 'email-verification' | 'forget-password',
    });
  } else {
    await sendOTPEmail({
      email,
      otp,
      type: type as 'sign-in' | 'email-verification' | 'forget-password',
    });
  }
}

// ============================================================================
// BETTER AUTH CONFIGURATION
// ============================================================================

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    DEFAULT_BASE_URL,
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
      app_id: {
        type: "string",
        defaultValue: "balikin_id",
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
      division: {
        type: "string",
      },
      blogPermissions: {
        type: "json",
      },
    },
  },
  session: {
    expiresIn: SESSION_EXPIRY_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_UPDATE_AGE_SECONDS, // Use updateAge (1 day) instead of full session expiry
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    cookiePrefix: process.env.NODE_ENV === 'production' ? 'balikin_auth' : 'balikin_auth_dev',
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookieAttributes: {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    },
  },
  logger: process.env.NODE_ENV !== 'production',
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email) {
            user.email = user.email.toLowerCase().trim();
          }
          return { data: user };
        },
      },
    },
  },
  trustedOrigins: Array.from(TRUSTED_ORIGINS),
  allowedRedirectURLs: Array.from(ALLOWED_REDIRECT_URLS),
  verification: {
    storeIdentifier: "plain",
    storeInDatabase: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOTP({ email, otp, type });
      },
      expiresIn: OTP_EXPIRY_SECONDS,
      allowedAttempts: OTP_MAX_ATTEMPTS,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

export { isWhatsAppIdentifier, extractPhoneNumber };
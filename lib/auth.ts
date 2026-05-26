import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { user, session, account, verification } from "@/db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function isWhatsAppIdentifier(email: string): boolean {
  return email.endsWith('@wa.dev');
}

function extractPhoneNumber(email: string): string {
  return email.replace(/@wa\.dev$/, '');
}

async function sendOTP({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: string;
}) {
  try {
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
  } catch (error) {
    throw error;
  }
}

export const auth = betterAuth({
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
      app_id: {
        type: "string",
        defaultValue: "balikin_id",
      },
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
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
    cookiePrefix: 'better-auth',
    useSecureCookies: false,
    sameSite: 'lax',
    cookieAttributes: {
      path: '/',
    },
  },
  logger: {
    enabled: false,
  },
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
  verification: {
    storeIdentifier: "plain",
    storeInDatabase: true,
  },
  socialProviders: {
    google: {
      clientId: googleClientId || "",
      clientSecret: googleClientSecret || "",
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOTP({ email, otp, type });
      },
      expiresIn: 5 * 60,
      allowedAttempts: 3,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

export { isWhatsAppIdentifier, extractPhoneNumber };
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

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
  if (isWhatsAppIdentifier(email)) {
    // Route to WhatsApp OTP
    const phoneNumber = extractPhoneNumber(email);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[WHATSAPP AUTH OTP] type=${type} phone=${phoneNumber} otp=${otp}`);
    }
    await sendWhatsAppOTP({
      phoneNumber,
      otp,
      type: type as 'sign-in' | 'email-verification' | 'forget-password',
    });
  } else {
    // Route to Email OTP
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL AUTH OTP] type=${type} email=${email} otp=${otp}`);
    }
    await sendOTPEmail({
      email,
      otp,
      type: type as 'sign-in' | 'email-verification' | 'forget-password',
    });
  }
}

/**
 * Main Auth Instance
 * Handles both Email and WhatsApp OTP authentication
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  appName: "Balikin",
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendOTP({ email, otp, type });
      },
      expiresIn: 5 * 60, // 5 minutes in seconds
      allowedAttempts: 3,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

// Export helpers for use in components
export { isWhatsAppIdentifier, extractPhoneNumber };

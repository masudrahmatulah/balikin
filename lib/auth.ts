import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendOTPEmail } from "@/lib/email";

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
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AUTH OTP CALLBACK] type=${type} email=${email} otp=${otp}`);
        }
        await sendOTPEmail({
          email,
          otp,
          type: type as 'sign-in' | 'email-verification' | 'forget-password',
        });
      },
      expiresIn: 5 * 60, // 5 minutes in seconds
      allowedAttempts: 3,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

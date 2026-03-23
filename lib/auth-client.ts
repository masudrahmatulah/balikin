import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// Main auth client (Email OTP)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [emailOTPClient()],
});

// WhatsApp auth client (separate instance with different endpoint prefix)
// The backend uses a separate "whatsapp" prefix for this
export const whatsappAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [emailOTPClient()],
});

// Extract hooks and methods from main auth client
export const { signIn, signUp, signOut, useSession } = authClient;

// Helper to format phone number with "@wa.dev" suffix for WhatsApp auth
// Using @wa.dev suffix instead of wa: prefix to pass Zod email validation
// The .dev TLD ensures it passes as a valid email format
export function formatWhatsAppEmail(phoneNumber: string): string {
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // If starts with 0, replace with 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  // If starts with +62, remove the +
  if (cleaned.startsWith('+62')) {
    cleaned = cleaned.replace('+', '');
  }

  // Return with @wa.dev suffix for identification (passes email validation)
  return `${cleaned}@wa.dev`;
}

// Helper to check if an email is actually a WhatsApp number
export function isWhatsAppIdentifier(email: string): boolean {
  return email.endsWith('@wa.dev');
}

// Helper to extract phone number from WhatsApp identifier
export function extractPhoneNumber(email: string): string {
  if (isWhatsAppIdentifier(email)) {
    return email.replace('@wa.dev', '');
  }
  return email;
}

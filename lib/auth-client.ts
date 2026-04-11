import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// Dynamic base URL that works with localhost, devtunnel, and production
// Uses environment variable in production, but falls back to current origin for development
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin (works with devtunnel, localhost, etc.)
    return window.location.origin.replace(/\/$/, '');
  }
  // Server-side: use environment variable or localhost
  return (process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/$/, '');
};

const BASE_URL = getBaseURL();

// Main auth client (Email OTP + Social Login)
export const authClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [emailOTPClient()],
  fetchOptions: {
    // Include credentials for all requests
    credentials: 'include',
  },
});

// WhatsApp auth client (separate instance with different endpoint prefix)
// The backend uses a separate "whatsapp" prefix for this
export const whatsappAuthClient = createAuthClient({
  baseURL: BASE_URL,
  plugins: [emailOTPClient()],
  fetchOptions: {
    // Include credentials for all requests
    credentials: 'include',
  },
});

// Extract hooks and methods from main auth client
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  emailOtp,  // Email OTP specific methods
} = authClient;

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

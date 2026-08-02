/**
 * Activation Cookie Management (FASE 3)
 * Stores temporary activation parameters (slug, token) in encrypted browser cookies
 * Grill Guard 2.1: Prevents state loss during registration flow
 */

import { IronSession, getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// ============================================================================
// TYPES
// ============================================================================

export interface ActivationCookieData {
  slug?: string;
  token?: string;
  timestamp?: number;
  redirectAfterLogin?: string; // Where to redirect after auth
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SESSION_COOKIE_NAME = 'balikin_activation_session';
const SESSION_PASSWORD = process.env.ACTIVATION_COOKIE_PASSWORD || 'default-dev-secret-change-in-production';
const SESSION_MAX_AGE = 30 * 60; // 30 minutes (Grill Guard 2.1)

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get activation session from encrypted cookie
 */
export async function getActivationSession(): Promise<ActivationCookieData> {
  const cookieStore = await cookies();

  return getIronSession<ActivationCookieData>(cookieStore, SESSION_COOKIE_NAME, {
    password: SESSION_PASSWORD,
    ttl: SESSION_MAX_AGE * 1000, // Convert to milliseconds
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    },
  });
}

/**
 * Set activation session data in encrypted cookie
 * Used when anonymous user scans QR activation code
 */
export async function setActivationSession(data: ActivationCookieData): Promise<void> {
  const session = await getActivationSession();

  session.slug = data.slug;
  session.token = data.token;
  session.timestamp = Date.now();
  session.redirectAfterLogin = data.redirectAfterLogin;

  await session.save();
}

/**
 * Clear activation session after successful claim
 * Called after user completes registration and claims the tag
 */
export async function clearActivationSession(): Promise<void> {
  const session = await getActivationSession();

  session.slug = undefined;
  session.token = undefined;
  session.timestamp = undefined;
  session.redirectAfterLogin = undefined;

  await session.save();
}

/**
 * Check if activation session is valid (not expired)
 * Returns true if session exists and is within 30-minute window
 */
export async function isValidActivationSession(): Promise<boolean> {
  const session = await getActivationSession();

  if (!session.slug || !session.timestamp) {
    return false;
  }

  const elapsed = Date.now() - session.timestamp;
  return elapsed < SESSION_MAX_AGE * 1000;
}

/**
 * Get redirect URL for post-login activation flow
 * Returns stored redirect or default to dashboard
 */
export async function getActivationRedirect(): Promise<string> {
  const session = await getActivationSession();

  if (session.redirectAfterLogin) {
    return session.redirectAfterLogin;
  }

  // If we have slug/token but no explicit redirect, go to activation page
  if (session.slug && session.token) {
    return `/activate/${session.slug}`;
  }

  return '/dashboard';
}

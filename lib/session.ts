import { headers } from 'next/headers';
import { auth } from './auth';
import type { Session } from './auth';

// ============================================================================
// TYPES
// ============================================================================

interface SessionError extends Error {
  code: 'SESSION_EXPIRED' | 'INVALID_TOKEN' | 'NETWORK_ERROR' | 'UNKNOWN';
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

class SessionFetchError extends Error implements SessionError {
  code: SessionError['code'];

  constructor(message: string, code: SessionError['code'] = 'UNKNOWN') {
    super(message);
    this.name = 'SessionFetchError';
    this.code = code;
  }
}

// ============================================================================
// SESSION FUNCTIONS
// ============================================================================

async function fetchSessionInternal(): Promise<Session | null> {
  const headersList = await headers();
  return auth.api.getSession({ headers: headersList }) as Promise<Session | null>;
}

export async function getSession(): Promise<Session | null> {
  try {
    return await fetchSessionInternal();
  } catch (error) {
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new SessionFetchError('Authentication required', 'UNKNOWN');
  }

  return session;
}

// Re-export types for convenience
export type { Session };
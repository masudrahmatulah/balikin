/**
 * Security utilities for input sanitization, XSS prevention, and rate limiting
 */

import { z } from 'zod';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_STRING_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;
const MAX_URL_LENGTH = 2048;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+62|62|0)[0-9]{9,12}$/;
const SLUG_REGEX = /^[a-z0-9-]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_STRING_REGEX = /^[a-zA-Z0-9\s\-_.,!?@#$%&*()]+$/;
const TAG_ID_REGEX = /^[a-zA-Z0-9_-]{10,50}$/;
const SHARE_CODE_REGEX = /^[a-zA-Z0-9]{8,12}$/;

// ============================================================================
// INPUT SANITIZATION & VALIDATION
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * - Removes script tags and event handlers
 * - Escapes special characters
 */
export function sanitizeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';

  return unsafe
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Escape HTML special chars
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHTML(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = MAX_STRING_LENGTH): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string | null {
  const sanitized = sanitizeString(email, 254);

  if (!EMAIL_REGEX.test(sanitized)) {
    return null;
  }

  return sanitized.toLowerCase();
}

/**
 * Sanitize and validate phone number
 */
export function sanitizePhone(phone: string): string | null {
  const sanitized = sanitizeString(phone, 20).replace(/\s/g, '');

  if (!PHONE_REGEX.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Validate URL is safe (no javascript:, data:, etc.)
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }

    // Check for dangerous patterns
    if (url.includes('javascript:') || url.includes('data:') || url.includes('vbscript:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate slug
 */
export function sanitizeSlug(slug: string): string | null {
  const sanitized = sanitizeString(slug, 100).toLowerCase();

  if (!SLUG_REGEX.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

/**
 * Sanitize text area input (longer strings allowed)
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, MAX_TEXT_LENGTH);
}

/**
 * Sanitize JSON data by recursively cleaning all string values
 */
export function sanitize(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = sanitize((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }

  return obj;
}

/**
 * Validate file upload
 */
export interface FileValidation {
  maxSize: number;
  allowedTypes: string[];
}

export function validateFile(file: File | { size: number; type: string }, validation: FileValidation): {
  valid: boolean;
  error?: string;
} {
  if (file.size > validation.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${validation.maxSize} bytes`,
    };
  }

  if (!validation.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Validate and sanitize share code format
 */
export function isValidShareCode(code: string): boolean {
  if (typeof code !== 'string') return false;

  if (code.length < 8 || code.length > 12) {
    return false;
  }

  return SHARE_CODE_REGEX.test(code);
}

/**
 * Validate phone number format (Indonesia)
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  return PHONE_REGEX.test(phone);
}

/**
 * Validate tag ID format
 */
export function validateTagId(tagId: string): boolean {
  if (typeof tagId !== 'string') return false;
  return TAG_ID_REGEX.test(tagId);
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T = unknown>(jsonString: string, fallback: T): T {
  if (typeof jsonString !== 'string') return fallback;

  try {
    const parsed = JSON.parse(jsonString);
    return sanitize(parsed) as T;
  } catch {
    return fallback;
  }
}

/**
 * Sanitize coordinate values (latitude, longitude)
 */
export function sanitizeCoordinate(value: number, range: { min: number; max: number }): number {
  if (isNaN(value)) return 0;
  return Math.max(range.min, Math.min(range.max, value));
}

/**
 * Sanitize IP address (basic validation)
 */
export function sanitizeIPAddress(ip: string): string {
  if (typeof ip !== 'string') return '';
  return ip.replace(/:\d+$/, '').trim();
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
}

const rateLimitStore = new Map<string, { count: number; resetTime: Date }>();

/**
 * In-memory rate limiter (for development)
 * Use Redis or similar for production
 */
export class InMemoryRateLimiter {
  constructor(private config: RateLimitConfig) {}

  async check(identifier: string): Promise<RateLimitResult> {
    const now = new Date();
    const resetTime = new Date(now.getTime() + this.config.windowMs);

    const existing = rateLimitStore.get(identifier);

    if (!existing || existing.resetTime <= now) {
      rateLimitStore.set(identifier, { count: 1, resetTime });

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    const newCount = existing.count + 1;

    if (newCount > this.config.maxRequests) {
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: existing.resetTime,
      };
    }

    existing.count = newCount;

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - newCount,
      resetTime: existing.resetTime,
    };
  }

  reset(identifier: string): void {
    rateLimitStore.delete(identifier);
  }

  cleanup(): void {
    const now = new Date();

    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime <= now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Predefined rate limiters
 */
export const rateLimiters = {
  api: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 100 }),
  auth: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 5 }),
  scan: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 10 }),
  qr: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 50 }),
  search: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 10 }),
  upload: new InMemoryRateLimiter({ windowMs: 60_000, maxRequests: 20 }),
};

// ============================================================================
// CSRF PROTECTION
// ============================================================================

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  return token === expectedToken && token.length > 0;
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Get security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(self)',
    'Strict-Transport-Security': process.env.NODE_ENV === 'production'
      ? 'max-age=31536000; includeSubDomains'
      : 'max-age=0',
  };
}

// ============================================================================
// CONTENT SECURITY POLICY
// ============================================================================

/**
 * Generate CSP header value
 */
export function generateCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.vercel-storage.com https://*.vercel.app",
    "connect-src 'self' https://api.resend.com https://wa.devtunnels.ms",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  return directives;
}

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

/**
 * Check password strength
 */
export interface PasswordStrength {
  score: number;
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include special characters');
  }

  return { score, feedback };
}

// ============================================================================
// SESSION SECURITY
// ============================================================================

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Generate nonce for CSP
 */
export function generateNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EMAIL_REGEX,
  PHONE_REGEX,
  SLUG_REGEX,
  UUID_REGEX,
  TAG_ID_REGEX,
  SHARE_CODE_REGEX,
  MAX_STRING_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_URL_LENGTH,
};

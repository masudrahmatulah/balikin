/**
 * Enhanced rate limiting with fingerprint-based detection
 * Prevents IP spoofing and provides more robust protection
 */

import { db } from '@/db';
import { rateLimit } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';

// ============================================================================
// CONSTANTS
// ============================================================================

const WINDOW_MS = 60 * 1000; // 1 minute window
const FINGERPRINT_SALT = process.env.RATE_LIMIT_SALT || 'balikin-rate-limit-salt';

const RATE_LIMIT_CONFIGS = {
  scan: { windowMs: WINDOW_MS, maxRequests: 10 },
  api: { windowMs: WINDOW_MS, maxRequests: 100 },
  qr: { windowMs: WINDOW_MS, maxRequests: 50 },
  search: { windowMs: WINDOW_MS, maxRequests: 10 },
  auth: { windowMs: WINDOW_MS, maxRequests: 5 },
  blog_comment: { windowMs: WINDOW_MS, maxRequests: 5 },
  blog_quiz: { windowMs: WINDOW_MS, maxRequests: 3 },
  blog_story: { windowMs: WINDOW_MS, maxRequests: 2 },
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

// ============================================================================
// FINGERPRINTING
// ============================================================================

/**
 * Generate request fingerprint from multiple factors
 * Combines IP, User-Agent, and a salt to create a stable identifier
 */
export function generateFingerprint(
  ip: string,
  userAgent: string,
  additionalFactors?: Record<string, string>
): string {
  const factors = [
    ip || 'unknown',
    userAgent || 'unknown',
    FINGERPRINT_SALT,
  ];

  if (additionalFactors) {
    Object.values(additionalFactors).forEach(value => {
      if (value) factors.push(value);
    });
  }

  const fingerprintData = factors.join('|');
  return createHash('sha256').update(fingerprintData).digest('hex');
}

/**
 * Extract real IP from headers with proxy detection
 */
export function extractRealIP(
  xForwardedFor: string | null,
  xRealIP: string | null,
  cfConnectingIP: string | null,
  vercelIP: string | null
): string {
  // Try to get the original IP from x-forwarded-for
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    // Take the leftmost IP (original client IP)
    const originalIP = ips[0];

    // Validate IP format
    if (isValidIP(originalIP)) {
      return originalIP;
    }
  }

  // Fallback to other headers
  const fallbackIP = xRealIP || cfConnectingIP || vercelIP;

  if (fallbackIP && isValidIP(fallbackIP)) {
    return fallbackIP;
  }

  return 'unknown';
}

/**
 * Validate IP address format (basic check)
 */
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// ============================================================================
// RATE LIMIT TYPES
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
  retryAfter?: number;
  fingerprint?: string;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// ============================================================================
// CORE RATE LIMIT LOGIC
// ============================================================================

/**
 * Check rate limit with fingerprint-based identification
 */
async function checkRateLimitInternal(
  identifier: string,
  actionType: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);
  const windowEnd = now;

  try {
    const existing = await db.query.rateLimit.findFirst({
      where: and(
        eq(rateLimit.identifier, identifier),
        eq(rateLimit.actionType, actionType),
        gt(rateLimit.windowEnd, windowStart)
      ),
    });

    if (existing) {
      if (existing.requestCount >= config.maxRequests) {
        const retryAfter = Math.ceil(
          (existing.windowEnd.getTime() - now.getTime()) / 1000
        );

        return {
          allowed: false,
          remaining: 0,
          resetTime: existing.windowEnd,
          retryAfter: Math.max(0, retryAfter),
        };
      }

      const newCount = existing.requestCount + 1;
      await db
        .update(rateLimit)
        .set({
          requestCount: newCount,
          windowEnd,
          updatedAt: now,
        })
        .where(eq(rateLimit.id, existing.id));

      return {
        allowed: true,
        remaining: config.maxRequests - newCount,
        resetTime: existing.windowEnd,
      };
    }

    await db.insert(rateLimit).values({
      identifier,
      actionType,
      requestCount: 1,
      windowStart,
      windowEnd,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: windowEnd,
    };
  } catch {
    // Fail open - if rate limiting fails, allow the request
    return { allowed: true, remaining: config.maxRequests };
  }
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Check rate limit using fingerprint
 * More secure than IP-based limiting
 */
export async function checkRateLimitByFingerprint(
  fingerprint: string,
  type: RateLimitType
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  const result = await checkRateLimitInternal(fingerprint, type, config);

  return {
    ...result,
    fingerprint,
  };
}

/**
 * Check rate limit by IP (legacy, less secure)
 */
export async function checkRateLimitByIP(
  ip: string,
  type: RateLimitType
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  return checkRateLimitInternal(ip, type, config);
}

/**
 * Check rate limit for blog comments
 */
export async function checkBlogCommentRateLimit(
  fingerprint: string
): Promise<RateLimitResult> {
  return checkRateLimitByFingerprint(fingerprint, 'blog_comment');
}

/**
 * Check rate limit for blog quiz claims
 */
export async function checkBlogQuizRateLimit(
  fingerprint: string
): Promise<RateLimitResult> {
  return checkRateLimitByFingerprint(fingerprint, 'blog_quiz');
}

/**
 * Check rate limit for true story submissions
 */
export async function checkBlogStoryRateLimit(
  fingerprint: string
): Promise<RateLimitResult> {
  return checkRateLimitByFingerprint(fingerprint, 'blog_story');
}

// ============================================================================
// RESPONSE HEADERS
// ============================================================================

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {};

  if (result.remaining !== undefined) {
    headers['X-RateLimit-Limit'] = String(
      result.remaining + (result.allowed ? 0 : 1)
    );
    headers['X-RateLimit-Remaining'] = String(result.remaining);
  }

  if (result.resetTime) {
    headers['X-RateLimit-Reset'] = String(
      Math.ceil(result.resetTime.getTime() / 1000)
    );
  }

  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Cleanup old rate limit records
 */
export async function cleanupOldRateLimits(): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - WINDOW_MS * 2);

    const result = await db
      .delete(rateLimit)
      .where(gt(rateLimit.windowEnd, cutoff))
      .returning();

    return result.length;
  } catch {
    return 0;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { RATE_LIMIT_CONFIGS };
export type { RateLimitType, RateLimitResult, RateLimitConfig };

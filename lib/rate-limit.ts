import { db } from '@/db';
import { rateLimit } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

// ============================================================================
// CONSTANTS
// ============================================================================

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5;
const MAX_SCAN_REQUESTS = 10;
const MAX_API_REQUESTS = 100;
const MAX_QR_REQUESTS = 50;
const MAX_SEARCH_REQUESTS = 10;
const MAX_AUTH_REQUESTS = 5;
const MAX_BLOG_COMMENT_REQUESTS = 5;
const MAX_BLOG_QUIZ_REQUESTS = 3;
const MAX_BLOG_STORY_REQUESTS = 2;

const RATE_LIMIT_CONFIGS = {
  scan: { windowMs: WINDOW_MS, maxRequests: MAX_SCAN_REQUESTS },
  api: { windowMs: WINDOW_MS, maxRequests: MAX_API_REQUESTS },
  qr: { windowMs: WINDOW_MS, maxRequests: MAX_QR_REQUESTS },
  search: { windowMs: WINDOW_MS, maxRequests: MAX_SEARCH_REQUESTS },
  auth: { windowMs: WINDOW_MS, maxRequests: MAX_AUTH_REQUESTS },
  blog_comment: { windowMs: WINDOW_MS, maxRequests: MAX_BLOG_COMMENT_REQUESTS },
  blog_quiz: { windowMs: WINDOW_MS, maxRequests: MAX_BLOG_QUIZ_REQUESTS },
  blog_story: { windowMs: WINDOW_MS, maxRequests: MAX_BLOG_STORY_REQUESTS },
} as const;

type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

// ============================================================================
// RATE LIMIT CHECK
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
  retryAfter?: number;
}

/**
 * Check rate limit for a specific action
 */
async function checkRateLimit(
  identifier: string,
  actionType: string,
  config: { windowMs: number; maxRequests: number }
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

/**
 * Check rate limit for tag scans
 */
export async function checkScanRateLimit(
  tagId: string,
  ip: string
): Promise<RateLimitResult> {
  const identifier = `${ip}:${tagId}`;
  return checkRateLimit(identifier, 'scan', RATE_LIMIT_CONFIGS.scan);
}

/**
 * Check generic rate limit by type
 */
export async function checkRateLimitByType(
  identifier: string,
  type: RateLimitType = 'api'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  return checkRateLimit(identifier, type, config);
}

/**
 * Check rate limit for blog comments
 */
export async function checkBlogCommentRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  return checkRateLimitByType(identifier, 'blog_comment');
}

/**
 * Check rate limit for blog quiz claims
 */
export async function checkBlogQuizRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  return checkRateLimitByType(identifier, 'blog_quiz');
}

/**
 * Check rate limit for true story submissions
 */
export async function checkBlogStoryRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  return checkRateLimitByType(identifier, 'blog_story');
}

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
// RATE LIMIT MIDDLEWARE HELPERS
// ============================================================================

/**
 * Create a rate limit middleware wrapper for API routes
 */
export function withRateLimit(type: RateLimitType) {
  return async (
    identifier: string,
    handler: () => Promise<Response>
  ): Promise<Response> => {
    const result = await checkRateLimitByType(identifier, type);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          code: 'RATE_LIMITED',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...getRateLimitHeaders(result),
          },
        }
      );
    }

    const response = await handler();

    // Add rate limit headers to response
    Object.entries(getRateLimitHeaders(result)).forEach(([key, value]) => {
      response.headers.set(key, String(value));
    });

    return response;
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { RATE_LIMIT_CONFIGS };
export type { RateLimitType };
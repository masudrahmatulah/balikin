/**
 * Common utilities for blog API routes
 * Extracted to eliminate code duplication
 */

import { NextRequest } from 'next/server';

/**
 * Get client IP address from request headers
 * Uses multiple fallback headers for different proxy configurations
 */
export async function getClientIP(request: NextRequest): Promise<string> {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP;

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  additionalData?: Record<string, any>
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code,
      ...additionalData,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

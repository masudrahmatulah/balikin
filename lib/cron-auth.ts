import type { NextRequest } from 'next/server';

export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  return request.headers.get('authorization') === `Bearer ${secret}`
    || request.headers.get('x-vercel-cron-secret') === secret;
}

import { db } from '@/db';
import { rateLimit } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5;

export async function checkScanRateLimit(
  tagId: string,
  ip: string
): Promise<{ allowed: boolean; remaining?: number }> {
  const identifier = `${ip}:${tagId}`;
  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  const windowEnd = now;

  try {
    const existing = await db.query.rateLimit.findFirst({
      where: and(
        eq(rateLimit.identifier, identifier),
        eq(rateLimit.actionType, 'scan'),
        gt(rateLimit.windowEnd, windowStart)
      ),
    });

    if (existing) {
      if (existing.requestCount >= MAX_REQUESTS) {
        return { allowed: false };
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

      return { allowed: true, remaining: MAX_REQUESTS - newCount };
    }

    await db.insert(rateLimit).values({
      identifier,
      actionType: 'scan',
      requestCount: 1,
      windowStart: new Date(now.getTime() - WINDOW_MS),
      windowEnd,
    });

    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
}

export async function cleanupOldRateLimits() {
  const cutoff = new Date(Date.now() - WINDOW_MS * 2);

  await db.delete(rateLimit).where(gt(rateLimit.windowEnd, cutoff));
}
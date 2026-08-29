import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { tags } from '@/db/schema';

const CRON_SECRET = process.env.CRON_SECRET;

function verifyCronAuthorization(request: NextRequest): boolean {
  if (!CRON_SECRET) return true;

  return request.headers.get('authorization') === `Bearer ${CRON_SECRET}`
    || request.headers.get('x-vercel-cron-secret') === CRON_SECRET;
}

export async function GET(request: NextRequest) {
  if (!verifyCronAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expiredDates = sql`${tags.createdAt} + interval '7 days'`;
    const result = await db
      .update(tags)
      .set({ expiresAt: expiredDates })
      .where(
        and(
          or(eq(tags.tier, 'free'), isNull(tags.tier)),
          isNull(tags.expiresAt),
        ),
      )
      .returning({ id: tags.id });

    if (result.length > 0) {
      revalidateTag('tags');
    }

    return NextResponse.json({ success: true, updated: result.length });
  } catch (error) {
    console.error('[Cron] Failed to backfill free tag expiration:', error);
    return NextResponse.json({ success: false, error: 'Failed to process free tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

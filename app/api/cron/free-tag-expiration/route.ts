import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { isCronAuthorized } from '@/lib/cron-auth';

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
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
          eq(tags.app_id, 'balikin_id'),
          isNull(tags.expiresAt),
        ),
      )
      .returning({ id: tags.id });

    if (result.length > 0) {
       revalidateTag('tags', 'max');
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

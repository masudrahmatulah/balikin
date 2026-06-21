import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count, and, gte, desc, inArray, sql } from 'drizzle-orm';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const thirtyDaysAgo = subDays(new Date(), 30);

    const userTags = await db.query.tags.findMany({
      where: and(eq(tags.ownerId, userId), eq(tags.app_id, 'balikin_id')),
      columns: {
        id: true,
        name: true,
        slug: true,
        status: true,
        tier: true,
        productType: true,
        isVerified: true,
      },
      orderBy: [desc(tags.createdAt)],
    });

    if (userTags.length === 0) {
      return NextResponse.json({
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          isVerified: false,
        },
        stats: {
          activeTags: 0,
          totalTags: 0,
          lostTags: 0,
          totalScans: 0,
          returnedItems: 0,
        },
        tags: [],
      });
    }

    const activeTagCount = userTags.filter(tag => tag.status !== 'lost').length;
    const lostTagCount = userTags.filter(tag => tag.status === 'lost').length;

    const tagIds = userTags.map(tag => tag.id);

    const stickerTagIds = userTags
      .filter(tag => tag.productType === 'sticker')
      .map(tag => tag.id);

    let totalScans = 0;

    if (stickerTagIds.length > 0) {
      const stickerScans = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(
          and(
            inArray(scanLogs.tagId, stickerTagIds),
            gte(scanLogs.scannedAt, thirtyDaysAgo)
          )
        );
      totalScans += stickerScans[0]?.count || 0;
    }

    const nonStickerTagIds = userTags
      .filter(tag => tag.productType !== 'sticker')
      .map(tag => tag.id);

    if (nonStickerTagIds.length > 0) {
      const allTimeScans = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(inArray(scanLogs.tagId, nonStickerTagIds));
      totalScans += allTimeScans[0]?.count || 0;
    }

    const returnedItems = Math.max(0, Math.floor(totalScans * 0.2));

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        isVerified: userTags.some(tag => tag.isVerified),
      },
      stats: {
        activeTags: activeTagCount,
        totalTags: userTags.length,
        lostTags: lostTagCount,
        totalScans,
        returnedItems,
      },
      tags: userTags,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

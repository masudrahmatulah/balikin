import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count, and, gte, desc } from 'drizzle-orm';
import { subDays } from 'date-fns';

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

    // Get user's tags
    const userTags = await db.query.tags.findMany({
      where: eq(tags.ownerId, userId),
      orderBy: [desc(tags.createdAt)],
    });

    // Calculate stats
    const activeTagCount = userTags.filter(tag => tag.status !== 'lost').length;
    const lostTagCount = userTags.filter(tag => tag.status === 'lost').length;

    // Get total scans
    let totalScans = 0;
    const thirtyDaysAgo = subDays(new Date(), 30);

    for (const tag of userTags) {
      if (tag.productType === 'sticker') {
        const stickerScans = await db
          .select({ count: count() })
          .from(scanLogs)
          .where(
            and(
              eq(scanLogs.tagId, tag.id),
              gte(scanLogs.scannedAt, thirtyDaysAgo)
            )
          );
        totalScans += stickerScans[0]?.count || 0;
      } else {
        const tagScans = await db
          .select({ count: count() })
          .from(scanLogs)
          .where(eq(scanLogs.tagId, tag.id));
        totalScans += tagScans[0]?.count || 0;
      }
    }

    // Calculate returned items (simplified)
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
        totalScans,
        returnedItems,
      },
      tags: userTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        status: tag.status,
        tier: tag.tier,
        productType: tag.productType,
        isVerified: tag.isVerified,
      })),
    });
  } catch (error) {
    console.error('[API] Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

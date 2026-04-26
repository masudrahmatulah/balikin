import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count, desc, and, gte } from 'drizzle-orm';
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

    // Get scan count for each tag
    const thirtyDaysAgo = subDays(new Date(), 30);

    const tagsWithScanCount = await Promise.all(
      userTags.map(async (tag) => {
        let scanCount = 0;
        let lastScanned: Date | null = null;

        if (tag.productType === 'sticker') {
          const scanResult = await db
            .select({ count: count(), scannedAt: scanLogs.scannedAt })
            .from(scanLogs)
            .where(
              and(
                eq(scanLogs.tagId, tag.id),
                gte(scanLogs.scannedAt, thirtyDaysAgo)
              )
            );
          scanCount = scanResult[0]?.count || 0;
          lastScanned = scanResult[0]?.scannedAt || null;
        } else {
          const scanResult = await db
            .select({ count: count(), scannedAt: scanLogs.scannedAt })
            .from(scanLogs)
            .where(eq(scanLogs.tagId, tag.id))
            .orderBy(desc(scanLogs.scannedAt))
            .limit(1);

          if (scanResult.length > 0) {
            // Get total count
            const totalResult = await db
              .select({ count: count() })
              .from(scanLogs)
              .where(eq(scanLogs.tagId, tag.id));
            scanCount = totalResult[0]?.count || 0;
            lastScanned = scanResult[0]?.scannedAt || null;
          }
        }

        return {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          status: tag.status,
          tier: tag.tier,
          productType: tag.productType,
          scanCount,
          lastScanned,
        };
      })
    );

    return NextResponse.json(tagsWithScanCount);
  } catch (error) {
    console.error('[API] Error fetching user tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

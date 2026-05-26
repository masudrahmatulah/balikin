/**
 * Lost & Found Rate Analytics Data Access Layer
 * Provides success rate metrics for lost items
 */

import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { and, gte, desc, sql, eq } from 'drizzle-orm';

interface LostFoundRateData {
  recoveryRate: number;
  totalLostEvents: number;
  recoveredItems: number;
  averageRecoveryHours: number;
  period: string;
}

/**
 * Get lost & found success rate metrics with app_id filtering
 */
export async function getLostFoundRateCached(days: number): Promise<LostFoundRateData> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let totalLostEvents = 0;
  let recoveredItems = 0;
  let recoveryTimes: number[] = [];

  try {
    const lostTags = await db
      .select({
        id: tags.id,
        status: tags.status,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .where(
        and(
          eq(tags.appId, 'balikin_id'),
          gte(tags.createdAt, startDate)
        )
      );

    totalLostEvents = lostTags.filter(t => t.status === 'lost').length;

    if (totalLostEvents > 0) {
      const lostTagIds = lostTags
        .filter(t => t.status === 'lost')
        .map(t => t.id);

      const recoveryScans = await db
        .select({
          tagId: scanLogs.tagId,
          scannedAt: scanLogs.scannedAt,
        })
        .from(scanLogs)
        .where(
          and(
            eq(scanLogs.appId, 'balikin_id'),
            sql`${scanLogs.tagId} = ANY(${lostTagIds})`
          )
        );

      const recoveredTagIds = new Set(recoveryScans.map(s => s.tagId));
      recoveredItems = recoveredTagIds.size;

      for (const tag of lostTags.filter(t => t.status === 'lost')) {
        if (recoveredTagIds.has(tag.id) && tag.createdAt) {
          const firstScan = recoveryScans
            .filter(s => s.tagId === tag.id)
            .sort((a, b) =>
              new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
            )[0];

          if (firstScan) {
            const recoveryTime = new Date(firstScan.scannedAt).getTime() -
              new Date(tag.createdAt).getTime();
            recoveryTimes.push(recoveryTime);
          }
        }
      }
    }
  } catch {
    // Return default values on error
  }

  const recoveryRate = totalLostEvents > 0
    ? (recoveredItems / totalLostEvents) * 100
    : 0;

  const averageRecoveryTime = recoveryTimes.length > 0
    ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length
    : 0;

  const avgHours = averageRecoveryTime / (1000 * 60 * 60);

  return {
    recoveryRate: Math.round(recoveryRate * 10) / 10,
    totalLostEvents,
    recoveredItems,
    averageRecoveryHours: Math.round(avgHours * 10) / 10,
    period: `${days} days`,
  };
}
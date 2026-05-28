/**
 * Geo Scans Analytics Data Access Layer
 * Provides geospatial scan data for heatmap visualization
 */

import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { count, and, gte, desc, sql, eq } from 'drizzle-orm';

interface GeoScanData {
  period: string;
  totalScans: number;
  topCities: Array<{ city: string | null; count: number }>;
  allCities: Array<{ city: string | null; count: number }>;
}

/**
 * Get geospatial scan data with app_id filtering
 */
const cachedGeoScanData = unstable_cache(
  async (days: number): Promise<GeoScanData> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const cityScans = await db
      .select({
        city: scanLogs.city,
        count: count(),
      })
      .from(scanLogs)
      .where(
        and(
          eq(scanLogs.appId, 'balikin_id'),
          gte(scanLogs.scannedAt, startDate),
          sql`${scanLogs.city} IS NOT NULL`
        )
      )
      .groupBy(scanLogs.city)
      .orderBy(desc(count()))
      .limit(20);

    const geoData = cityScans.map(s => ({
      city: s.city,
      count: typeof s.count === 'number' ? s.count : parseInt(String(s.count || '0'), 10),
    }));

    return {
      period: `${days} days`,
      totalScans: geoData.reduce((sum, d) => sum + d.count, 0),
      topCities: geoData.slice(0, 10),
      allCities: geoData,
    };
  } catch {
    return {
      period: `${days} days`,
      totalScans: 0,
      topCities: [],
      allCities: [],
    };
  },
  ['geo-scans'],
  { revalidate: 900, tags: ['admin-analytics', 'geo-scans'] }
);

export async function getGeoScanDataCached(days: number): Promise<GeoScanData> {
  return cachedGeoScanData(days);
}
'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { handleScanAlert } from '@/lib/notifications';
import { checkScanRateLimit } from '@/lib/rate-limit';
import { eq } from 'drizzle-orm';

interface ClientLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export async function logScan(tagId: string, clientLocation?: ClientLocation): Promise<string | null> {
  try {
    const headersList = await headers();

    const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
               headersList.get('x-real-ip') ||
               'unknown';

    const rateLimitCheck = await checkScanRateLimit(tagId, ip);
    if (!rateLimitCheck.allowed) {
      return null;
    }

    const vercelCity = headersList.get('x-vercel-ip-city');
    const vercelCountry = headersList.get('x-vercel-ip-country');
    const vercelLat = headersList.get('x-vercel-ip-latitude');
    const vercelLon = headersList.get('x-vercel-ip-longitude');
    const userAgent = headersList.get('user-agent');

    let deviceInfo = 'Unknown Device';
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceInfo = 'Mobile Device';
        if (ua.includes('iphone')) {
          deviceInfo = 'iPhone';
        } else if (ua.includes('android')) {
          deviceInfo = 'Android';
        }
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceInfo = 'Tablet';
      } else {
        deviceInfo = 'Desktop';
      }
    }

    // Use client location if available (more accurate), otherwise fallback to IP-based location
    const useClientLocation = clientLocation && clientLocation.latitude && clientLocation.longitude;

    const insertedScan = await db
      .insert(scanLogs)
      .values({
        tagId,
        ipAddress: ip,
        city: vercelCity ? `${vercelCity}${vercelCountry ? `, ${vercelCountry}` : ''}` : null,
        latitude: useClientLocation ? clientLocation.latitude.toString() : (vercelLat || null),
        longitude: useClientLocation ? clientLocation.longitude.toString() : (vercelLon || null),
        deviceInfo,
      })
      .returning({ id: scanLogs.id });

    const scanLogId = insertedScan[0]?.id;
    if (scanLogId) {
      handleScanAlert(tagId, scanLogId).catch(() => {
        // Background task failure - ignore to not block response
      });
      return scanLogId;
    }
  } catch {
    // Silent fail - don't expose errors to client
  }
  return null;
}

export async function updateScanLocation(scanLogId: string, clientLocation: ClientLocation) {
  try {
    await db
      .update(scanLogs)
      .set({
        latitude: clientLocation.latitude.toString(),
        longitude: clientLocation.longitude.toString(),
      })
      .where(eq(scanLogs.id, scanLogId));
  } catch {
    // Silent fail - don't expose errors to client
  }
}

/**
 * Update the most recent scan log for a tag with client location
 * Used by premium geolocation feature after initial IP-based scan is logged
 */
export async function updateLatestScanLocation(tagId: string, clientLocation: ClientLocation) {
  try {
    // Get the most recent scan log for this tag
    const latestScans = await db
      .select()
      .from(scanLogs)
      .where(eq(scanLogs.tagId, tagId))
      .orderBy(scanLogs.scannedAt)
      .limit(1);

    if (latestScans.length > 0) {
      const latestScan = latestScans[0];
      await db
        .update(scanLogs)
        .set({
          latitude: clientLocation.latitude.toString(),
          longitude: clientLocation.longitude.toString(),
        })
        .where(eq(scanLogs.id, latestScan.id));
      return { success: true, scanId: latestScan.id };
    }
    return { success: false, error: 'No scan found' };
  } catch {
    return { success: false, error: 'Database error' };
  }
}
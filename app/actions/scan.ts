'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { handleScanAlert } from '@/lib/notifications';
import { checkScanRateLimit } from '@/lib/rate-limit';
import { eq, and, desc, gt } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export interface ClientLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ScanLogResult {
  success: boolean;
  scanLogId?: string;
  rateLimited?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAG_ID_REGEX = /^[a-zA-Z0-9_-]{10,50}$/;
const LATITUDE_RANGE = { min: -90, max: 90 };
const LONGITUDE_RANGE = { min: -180, max: 180 };
const DEVICE_PATTERNS = {
  mobile: ['iphone', 'android', 'mobile'],
  tablet: ['ipad', 'tablet'],
  desktop: ['windows', 'macintosh', 'linux', 'x11']
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateTagId(tagId: string): boolean {
  return TAG_ID_REGEX.test(tagId);
}

function validateCoordinate(value: number, range: { min: number; max: number }): boolean {
  return !isNaN(value) && value >= range.min && value <= range.max;
}

function validateClientLocation(location?: ClientLocation): boolean {
  if (!location) return true;
  return (
    validateCoordinate(location.latitude, LATITUDE_RANGE) &&
    validateCoordinate(location.longitude, LONGITUDE_RANGE)
  );
}

// ============================================================================
// DEVICE DETECTION
// ============================================================================

function detectDevice(userAgent: string | null): string {
  if (!userAgent) return 'Unknown Device';

  const ua = userAgent.toLowerCase();

  for (const [type, patterns] of Object.entries(DEVICE_PATTERNS)) {
    if (patterns.some(pattern => ua.includes(pattern))) {
      return type === 'desktop' ? 'Desktop' :
             type === 'tablet' ? 'Tablet' :
             ua.includes('iphone') ? 'iPhone' :
             ua.includes('android') ? 'Android' : 'Mobile Device';
    }
  }

  return 'Unknown Device';
}

// ============================================================================
// SCAN ACTIONS
// ============================================================================

/**
 * Log a scan event for a tag with rate limiting and location data
 * @param tagId - The tag identifier to log scan for
 * @param clientLocation - Optional client-side GPS coordinates (more accurate)
 * @returns ScanLogResult with success status and scan ID
 */
export async function logScan(tagId: string, clientLocation?: ClientLocation): Promise<ScanLogResult> {
  try {
    if (!validateTagId(tagId)) {
      return { success: false, rateLimited: false };
    }

    if (!validateClientLocation(clientLocation)) {
      return { success: false, rateLimited: false };
    }

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               headersList.get('x-real-ip')?.trim() ||
               'unknown';

    const rateLimitCheck = await checkScanRateLimit(tagId, ip);
    if (!rateLimitCheck.allowed) {
      return { success: false, rateLimited: true };
    }

    const vercelCity = headersList.get('x-vercel-ip-city');
    const vercelCountry = headersList.get('x-vercel-ip-country');
    const vercelLat = headersList.get('x-vercel-ip-latitude');
    const vercelLon = headersList.get('x-vercel-ip-longitude');
    const userAgent = headersList.get('user-agent');

    const deviceInfo = detectDevice(userAgent);
    const useClientLocation = clientLocation?.latitude && clientLocation?.longitude;

    const city = vercelCity ? `${vercelCity}${vercelCountry ? `, ${vercelCountry}` : ''}` : null;
    const latitude = useClientLocation ? clientLocation.latitude.toString() : (vercelLat || null);
    const longitude = useClientLocation ? clientLocation.longitude.toString() : (vercelLon || null);

    const insertedScan = await db
      .insert(scanLogs)
      .values({
        tagId,
        ipAddress: ip,
        city,
        latitude,
        longitude,
        deviceInfo,
      })
      .returning({ id: scanLogs.id });

    const scanLogId = insertedScan[0]?.id;

    if (scanLogId) {
      handleScanAlert(tagId, scanLogId).catch(() => {
      });
      return { success: true, scanLogId };
    }

    return { success: false };
  } catch {
    return { success: false };
  }
}

/**
 * Update scan log with more accurate client-side GPS coordinates
 * @param scanLogId - The scan log identifier to update
 * @param clientLocation - Client-side GPS coordinates
 * @returns Success status
 */
export async function updateScanLocation(scanLogId: string, clientLocation: ClientLocation): Promise<boolean> {
  try {
    if (!validateClientLocation(clientLocation)) {
      return false;
    }

    await db
      .update(scanLogs)
      .set({
        latitude: clientLocation.latitude.toString(),
        longitude: clientLocation.longitude.toString(),
      })
      .where(eq(scanLogs.id, scanLogId));

    return true;
  } catch {
    return false;
  }
}

/**
 * Update the most recent scan log for a tag with client location
 * Used by premium geolocation feature after initial IP-based scan is logged
 * @param tagId - The tag identifier
 * @param clientLocation - Client-side GPS coordinates
 * @returns Object with success status and scan ID
 */
export async function updateLatestScanLocation(tagId: string, clientLocation: ClientLocation): Promise<{
  success: boolean;
  scanId?: string;
  error?: string;
}> {
  try {
    if (!validateTagId(tagId)) {
      return { success: false, error: 'Invalid tag ID' };
    }

    if (!validateClientLocation(clientLocation)) {
      return { success: false, error: 'Invalid coordinates' };
    }

    const latestScans = await db
      .select({ id: scanLogs.id })
      .from(scanLogs)
      .where(eq(scanLogs.tagId, tagId))
      .orderBy(desc(scanLogs.scannedAt))
      .limit(1);

    if (latestScans.length === 0) {
      return { success: false, error: 'No scan found' };
    }

    const { id: latestScanId } = latestScans[0];

    await db
      .update(scanLogs)
      .set({
        latitude: clientLocation.latitude.toString(),
        longitude: clientLocation.longitude.toString(),
      })
      .where(eq(scanLogs.id, latestScanId));

    return { success: true, scanId: latestScanId };
  } catch {
    return { success: false, error: 'Database error' };
  }
}

/**
 * Get scan count for a tag in the last 24 hours
 * @param tagId - The tag identifier
 * @returns Number of scans in the last 24 hours
 */
export async function getScanCount24h(tagId: string): Promise<number> {
  try {
    if (!validateTagId(tagId)) {
      return 0;
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await db
      .select({ count: scanLogs.id })
      .from(scanLogs)
      .where(
        and(
          eq(scanLogs.tagId, tagId),
          gt(scanLogs.scannedAt, yesterday)
        )
      );

    return count.length;
  } catch {
    return 0;
  }
}
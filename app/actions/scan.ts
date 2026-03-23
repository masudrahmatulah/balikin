'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { handleScanAlert } from '@/lib/notifications';

export async function logScan(tagId: string) {
  const headersList = await headers();

  const vercelCity = headersList.get('x-vercel-ip-city');
  const vercelCountry = headersList.get('x-vercel-ip-country');
  const vercelLat = headersList.get('x-vercel-ip-latitude');
  const vercelLon = headersList.get('x-vercel-ip-longitude');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';
  const userAgent = headersList.get('user-agent') || null;

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

  try {
    const insertedScan = await db
      .insert(scanLogs)
      .values({
        tagId,
        ipAddress: ip,
        city: vercelCity ? `${vercelCity}${vercelCountry ? `, ${vercelCountry}` : ''}` : null,
        latitude: vercelLat || null,
        longitude: vercelLon || null,
        deviceInfo,
      })
      .returning({ id: scanLogs.id });

    const scanLogId = insertedScan[0]?.id;
    if (scanLogId) {
      handleScanAlert(tagId, scanLogId).catch((error) => {
        console.error('[Scan Alert] Failed in background:', error);
      });
    }
  } catch (error) {
    console.error('Failed to log scan:', error);
  }
}

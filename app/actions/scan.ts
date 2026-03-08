'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { scanLogs } from '@/db/schema';
import { uuid } from 'drizzle-orm/pg-core';

export async function logScan(tagId: string) {
  const headersList = await headers();

  const vercelCity = headersList.get('x-vercel-ip-city');
  const vercelCountry = headersList.get('x-vercel-ip-country');
  const vercelLat = headersList.get('x-vercel-ip-latitude');
  const vercelLon = headersList.get('x-vercel-ip-longitude');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
             headersList.get('x-real-ip') ||
             'unknown';

  try {
    await db.insert(scanLogs).values({
      tagId,
      ipAddress: ip,
      city: vercelCity ? `${vercelCity}${vercelCountry ? `, ${vercelCountry}` : ''}` : null,
      latitude: vercelLat || null,
      longitude: vercelLon || null,
    });
  } catch (error) {
    console.error('Failed to log scan:', error);
    // Don't throw - logging failure shouldn't break the user experience
  }
}

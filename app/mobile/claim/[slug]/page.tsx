import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs, emergencyInformation } from '@/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import { logScan } from '@/app/actions/scan';
import { MobileClaim } from '@/components/mobile/mobile-claim';
import { JsonLd } from '@/components/json-ld';

interface MobileClaimPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Info Barang',
  description: 'Halaman claim mobile Balikin.',
  robots: 'noindex, nofollow',
};

/**
 * Get tag data for claim page.
 * Cached for 5 minutes to improve performance for frequently scanned tags.
 */
async function getTagData(slug: string) {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  return tag;
}

/**
 * Get emergency information for a tag.
 * Cached for 10 minutes since it changes infrequently.
 */
async function getEmergencyInfo(tagId: string) {
  const emergencyInfo = await db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tagId),
  });

  return emergencyInfo;
}

/**
 * Get recent scan logs for lost tags.
 */
async function getRecentScans(tagId: string, isStickerTag: boolean) {
  const stickerHistoryCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return db.query.scanLogs.findMany({
    where: isStickerTag
      ? and(eq(scanLogs.tagId, tagId), gte(scanLogs.scannedAt, stickerHistoryCutoff))
      : eq(scanLogs.tagId, tagId),
    orderBy: [desc(scanLogs.scannedAt)],
    limit: 5,
  });
}

export default async function MobileClaimPage({ params }: MobileClaimPageProps) {
  const { slug } = await params;

  // Get tag data
  const tag = await getTagData(slug);

  if (!tag) {
    notFound();
  }

  // Log scan if status is lost (non-cached for real-time tracking)
  if (tag.status === 'lost') {
    logScan(tag.id);
  }

  const isLost = tag.status === 'lost';
  const isFreeTag = tag.productType === 'free';
  const isStickerTag = tag.productType === 'sticker';

  // Get recent scan logs and emergency info in parallel
  let recentScans: typeof scanLogs.$inferSelect[] = [];
  let emergencyInfo: typeof emergencyInformation.$inferSelect | null = null;

  if (isLost && !isFreeTag) {
    [recentScans, emergencyInfo] = await Promise.all([
      getRecentScans(tag.id, isStickerTag),
      getEmergencyInfo(tag.id),
    ]);
  } else {
    emergencyInfo = await getEmergencyInfo(tag.id);
  }

  // Generate structured data for lost items
  const structuredData = isLost ? {
    '@context': 'https://schema.org',
    '@type': 'LostItem',
    name: tag.name,
    description: tag.customMessage || `${tag.name} hilang. Jika menemukan, hubungi pemilik.`,
    identifier: tag.slug,
    found: 'false',
    potentialAction: tag.contactWhatsapp ? {
      '@type': 'InformAction',
      name: 'Hubungi Pemilik',
      target: `https://wa.me/${tag.contactWhatsapp}`,
    } : undefined,
  } : {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tag.name,
    description: tag.customMessage || 'Tag Balikin Smart Lost & Found',
    identifier: tag.slug,
    brand: {
      '@type': 'Brand',
      name: 'Balikin',
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <MobileClaim
        tag={tag}
        isLost={isLost}
        isFreeTag={isFreeTag}
        isStickerTag={isStickerTag}
        recentScans={recentScans}
        emergencyInfo={emergencyInfo}
      />
    </>
  );
}
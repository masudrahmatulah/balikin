import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs, emergencyInformation } from '@/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import { logScan } from '@/app/actions/scan';
import { MobileClaim } from '@/components/mobile/mobile-claim';

interface MobileClaimPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Info Barang',
  description: 'Halaman claim mobile Balikin.',
  robots: 'noindex, nofollow',
};

export default async function MobileClaimPage({ params }: MobileClaimPageProps) {
  const { slug } = await params;

  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (!tag) {
    notFound();
  }

  // Log scan if status is lost
  if (tag.status === 'lost') {
    logScan(tag.id).catch(console.error);
  }

  const isLost = tag.status === 'lost';
  const isFreeTag = tag.productType === 'free';
  const isStickerTag = tag.productType === 'sticker';
  const stickerHistoryCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get recent scan logs
  let recentScans: typeof scanLogs.$inferSelect[] = [];
  if (isLost && !isFreeTag) {
    recentScans = await db.query.scanLogs.findMany({
      where: isStickerTag
        ? and(eq(scanLogs.tagId, tag.id), gte(scanLogs.scannedAt, stickerHistoryCutoff))
        : eq(scanLogs.tagId, tag.id),
      orderBy: [desc(scanLogs.scannedAt)],
      limit: 5,
    });
  }

  // Get emergency information
  const emergencyInfo = await db.query.emergencyInformation.findFirst({
    where: eq(emergencyInformation.tagId, tag.id),
  });

  return (
    <MobileClaim
      tag={tag}
      isLost={isLost}
      isFreeTag={isFreeTag}
      isStickerTag={isStickerTag}
      recentScans={recentScans}
      emergencyInfo={emergencyInfo}
    />
  );
}

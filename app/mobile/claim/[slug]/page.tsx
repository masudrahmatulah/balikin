import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, emergencyInformation } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { logScan } from '@/app/actions/scan';
import { MobileClaim } from '@/components/mobile/mobile-claim';
import { isFreeProduct, isStickerProduct } from '@/lib/product';
import { isTagExpired } from '@/lib/tag-expiration';

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
    where: and(eq(tags.slug, slug), eq(tags.app_id, 'balikin_id')),
    columns: {
      id: true,
      ownerId: true,
      activationPinHash: true,
      name: true,
      status: true,
      contactWhatsapp: true,
      customMessage: true,
      rewardNote: true,
      tier: true,
      productType: true,
      slug: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return tag;
}

/**
 * Get emergency information for a tag.
 * Cached for 10 minutes since it changes infrequently.
 */
async function getEmergencyInfo(tagId: string) {
  const emergencyInfo = await db.query.emergencyInformation.findFirst({
    where: and(
      eq(emergencyInformation.tagId, tagId),
      eq(emergencyInformation.app_id, 'balikin_id')
    ),
    columns: {
      emergencyContact: true,
      emergencyContactName: true,
      bloodType: true,
      allergies: true,
      medicalConditions: true,
    },
  });

  return emergencyInfo ?? null;
}

export default async function MobileClaimPage({ params }: MobileClaimPageProps) {
  const { slug } = await params;

  // Get tag data
  const tag = await getTagData(slug);

  if (!tag) {
    notFound();
  }

  // Samakan dengan /p/[slug]: scan pertama tag ber-PIN (akrilik/stiker)
  // wajib lewat /claim agar PIN diverifikasi sebelum konten tampil.
  if (!tag.ownerId && tag.activationPinHash) {
    redirect(`/claim/${tag.id}`);
  }

  const isLost = tag.status === 'lost';
  const isFreeTag = isFreeProduct(tag);
  const isStickerTag = isStickerProduct(tag);
  const isExpired = isFreeTag && isTagExpired(tag);

  // Expired free tags are shown without exposing owner contact information.
  if (!isExpired) {
    logScan(tag.id).catch(console.error);
  }

  // Emergency information is public tag content; scan location history is not.
  const emergencyInfo = !isExpired ? await getEmergencyInfo(tag.id) : null;

  return (
    <>
      <MobileClaim
        tag={{
          id: tag.id,
          name: tag.name,
          hasContactWhatsapp: Boolean(tag.contactWhatsapp),
          customMessage: tag.customMessage,
          rewardNote: tag.rewardNote,
          slug: tag.slug,
        }}
        isLost={isLost}
        isFreeTag={isFreeTag}
        isStickerTag={isStickerTag}
        isExpired={isExpired}
        isUnclaimed={!tag.ownerId}
        emergencyInfo={emergencyInfo}
      />
    </>
  );
}

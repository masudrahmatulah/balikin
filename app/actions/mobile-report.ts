'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';

const TAG_CACHE_TTL = 300; // 5 minutes
const QR_CODE_PATTERN = /^[a-zA-Z0-9-]{3,20}$/;

interface ReportFoundItemParams {
  qrCode: string;
  location: string;
  message?: string;
  finderEmail?: string;
  finderPhone?: string;
}

function sanitizeInput(input: string, maxLength: number = 500): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>{}]/g, '');
}

function validateQRCode(qrCode: string): boolean {
  return QR_CODE_PATTERN.test(qrCode);
}

const getTagBySlug = cache(async (slug: string) => {
  return db.query.tags.findFirst({
    where: and(eq(tags.slug, slug), eq(tags.appId, 'balikin_id')),
  });
});

export async function reportFoundItem(params: ReportFoundItemParams) {
  try {
    const { qrCode, location, message } = params;

    if (!validateQRCode(qrCode)) {
      return { success: false, error: 'Kode QR tidak valid' };
    }

    const sanitizedLocation = sanitizeInput(location, 200);
    if (!sanitizedLocation) {
      return { success: false, error: 'Lokasi tidak boleh kosong' };
    }

    const sanitizedMessage = message ? sanitizeInput(message, 500) : '';

    const tag = await getTagBySlug(qrCode);

    if (!tag) {
      return { success: false, error: 'QR Code tidak ditemukan' };
    }

    await db.insert(scanLogs).values({
      tagId: tag.id,
      city: sanitizedLocation,
      deviceInfo: sanitizedMessage ? `Finder message: ${sanitizedMessage}` : 'Found item report via mobile',
      ipAddress: (await headers()).get('x-forwarded-for')?.split(',')[0] || null,
    });

    revalidatePath(`/p/${tag.slug}`);
    revalidatePath(`/mobile/claim/${tag.slug}`);

    return {
      success: true,
      tagName: tag.name,
      ownerContact: tag.contactWhatsapp,
      message: 'Laporan berhasil dikirim',
    };
  } catch {
    return {
      success: false,
      error: 'Terjadi kesalahan saat mengirim laporan',
    };
  }
}

export async function getTagByQR(qrCode: string) {
  try {
    if (!validateQRCode(qrCode)) {
      return { success: false, error: 'Kode QR tidak valid' };
    }

    const tag = await getTagBySlug(qrCode);

    if (!tag) {
      return { success: false, error: 'QR Code tidak ditemukan' };
    }

    return {
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        status: tag.status,
        contactWhatsapp: tag.contactWhatsapp,
      },
    };
  } catch {
    return { success: false, error: 'Terjadi kesalahan' };
  }
}

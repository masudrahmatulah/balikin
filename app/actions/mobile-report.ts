'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

interface ReportFoundItemParams {
  qrCode: string;
  location: string;
  message?: string;
  finderEmail?: string;
  finderPhone?: string;
}

export async function reportFoundItem(params: ReportFoundItemParams) {
  try {
    const { qrCode, location, message, finderEmail, finderPhone } = params;

    // Find the tag by slug or QR code
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, qrCode),
    });

    if (!tag) {
      return {
        success: false,
        error: 'QR Code tidak valid atau tidak ditemukan',
      };
    }

    // Log the scan/found report
    await db.insert(scanLogs).values({
      tagId: tag.id,
      city: location || 'Unknown',
      deviceInfo: message ? `Finder message: ${message}` : 'Found item report via mobile',
    });

    // If the tag is lost, send notification to owner
    if (tag.status === 'lost' && tag.contactWhatsapp) {
      // TODO: Implement WhatsApp notification
      // For now, just log that notification should be sent
      console.log('[REPORT] Tag is lost, should notify owner:', tag.contactWhatsapp);
    }

    revalidatePath(`/p/${tag.slug}`);
    revalidatePath(`/mobile/claim/${tag.slug}`);

    return {
      success: true,
      tagName: tag.name,
      ownerContact: tag.contactWhatsapp,
      message: 'Laporan berhasil dikirim',
    };
  } catch (error) {
    console.error('[REPORT] Error reporting found item:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan saat mengirim laporan',
    };
  }
}

export async function getTagByQR(qrCode: string) {
  try {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, qrCode),
    });

    if (!tag) {
      return {
        success: false,
        error: 'QR Code tidak valid',
      };
    }

    return {
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        status: tag.status,
        contactWhatsapp: tag.contactWhatsapp,
        customMessage: tag.customMessage,
        rewardNote: tag.rewardNote,
      },
    };
  } catch (error) {
    console.error('[REPORT] Error getting tag:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan',
    };
  }
}

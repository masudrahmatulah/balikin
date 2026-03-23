'use server';

import { headers } from 'next/headers';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/session';
import QRCode from 'qrcode';

export async function generateQRCodePNG(tagSlug: string) {
  const session = await requireAuth();

  // Verify tag ownership
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    throw new Error('Tag not found');
  }

  // Generate QR
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;

  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  return { dataUrl: qrDataUrl, filename: `balikin-${tagSlug}.png` };
}

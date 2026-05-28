'use server';

import { cache } from 'react';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/session';
import { cacheTag } from 'next/cache';

/**
 * Generate QR Code as PNG data URL
 * @param tagSlug - The tag slug to generate QR for
 * @returns Object with dataUrl and filename
 */
export async function generateQRCodePNG(tagSlug: string) {
  cacheTag('qr-codes', `tag-${tagSlug}`);

  const session = await requireAuth();

  // Verify tag ownership
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    throw new Error('Tag not found');
  }

  // Return metadata only - actual QR generation is client-side
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;

  return {
    qrUrl,
    filename: `balikin-${tagSlug}.png`,
    slug: tagSlug,
  };
}

/**
 * Generate QR Code as SVG string
 * @param tagSlug - The tag slug to generate QR for
 * @returns SVG string
 */
export async function generateQRCodeSVG(tagSlug: string) {
  cacheTag('qr-codes', `tag-${tagSlug}`);

  const session = await requireAuth();

  // Verify tag ownership
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, tagSlug),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    throw new Error('Tag not found');
  }

  // Generate SVG using qrcode library
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;

  const QRCode = await import('qrcode');
  const svg = await QRCode.toString(qrUrl, {
    type: 'svg',
    width: 300,
    margin: 2,
    color: { dark: '#1f2937', light: '#ffffff' },
  });

  return {
    svg,
    filename: `balikin-${tagSlug}.svg`,
    slug: tagSlug,
  };
}
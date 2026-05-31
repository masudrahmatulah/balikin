'use server';

import { eq } from 'drizzle-orm';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import { isAdmin } from '@/lib/admin';
import { db } from '@/db';
import { tagBundles, tags } from '@/db/schema';
import {
  A3_WIDTH,
  A3_HEIGHT,
  BLEED,
  SPACING,
  HEADER_HEIGHT,
  getStickerDimensions,
  calculateGridPositions,
  type StickerShape,
  type StickerSize,
} from '@/lib/sticker-template';
import { unstable_cache as cache } from 'next/cache';

// ============================================================================
// CONSTANTS
// ============================================================================

const BUNDLE_ID_REGEX = /^[a-zA-Z0-9_-]{15,50}$/;
const COLOR_BG_BLUE = [14, 165, 233] as const;
const COLOR_BORDER_BLUE = [3, 105, 161] as const;
const COLOR_WHITE = [255, 255, 255] as const;
const COLOR_GRAY = [150, 150, 150] as const;

const REG_MARKS: ReadonlyArray<[number, number]> = [
  [10, 10],
  [A3_WIDTH - 10, 10],
  [10, A3_HEIGHT - 10],
  [A3_WIDTH - 10, A3_HEIGHT - 10],
] as const;

const TEXT_CONTENT = {
  header: 'BALIKIN - Smart Lost & Found',
  question: 'MENEMUKAN BARANG INI?',
  instruction: 'Scan untuk hubungi pemilik.',
  thanks: 'Terima kasih orang baik!',
  brand: '[BALIKIN]',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface QRCodeCacheKey {
  baseUrl: string;
  tagSlug: string;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateBundleId(bundleId: string): boolean {
  return BUNDLE_ID_REGEX.test(bundleId);
}

// ============================================================================
// PDF DRAWING HELPERS
// ============================================================================

function addRegistrationMarks(doc: jsPDF): void {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  for (const [x, y] of REG_MARKS) {
    doc.circle(x, y, 2.5, 'S');
    doc.line(x - 4, y, x + 4, y);
    doc.line(x, y - 4, x, y + 4);
  }
}

function addHeaderBar(doc: jsPDF): void {
  doc.setFillColor(...COLOR_BG_BLUE);
  doc.rect(0, 20, A3_WIDTH, HEADER_HEIGHT, 'F');

  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(0.5);
  doc.line(0, 20 + HEADER_HEIGHT, A3_WIDTH, 20 + HEADER_HEIGHT);

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(TEXT_CONTENT.header, A3_WIDTH / 2, 20 + HEADER_HEIGHT / 2 + 2, { align: 'center' });
}

function addBleedLine(doc: jsPDF, x: number, y: number, width: number, height: number, shape: StickerShape): void {
  doc.setDrawColor(...COLOR_GRAY);
  doc.setLineDashPattern([0.5, 0.5], 0);
  doc.setLineWidth(0.1);

  if (shape === 'circle') {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    doc.circle(centerX, centerY, radius, 'S');
  } else {
    doc.rect(x, y, width, height, 'S');
  }

  doc.setLineDashPattern([], 0);
}

// ============================================================================
// QR CODE GENERATION (CACHED)
// ============================================================================

async function generateQRCodeCached(qrUrl: string): Promise<string> {
  return cache(
    async () => {
      return toDataURL(qrUrl, {
        width: 200,
        margin: 0,
        errorCorrectionLevel: 'H',
        color: { dark: '#1f2937', light: '#ffffff' }
      });
    },
    ['qr-code', qrUrl],
    { revalidate: 86400 }
  )();
}

// ============================================================================
// STICKER DRAWING FUNCTIONS
// ============================================================================

function addStickerText(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  tagSlug: string
): void {
  const fontScale = size / 40;
  const centerX = x + size / 2;

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(7 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text(TEXT_CONTENT.question, centerX, y + (10 * fontScale), { align: 'center' });

  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (13 * fontScale);

  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  doc.setFontSize(6 * fontScale);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_WHITE);
  doc.text(TEXT_CONTENT.instruction, centerX, y + size - (2 * fontScale), { align: 'center' });
  doc.text(TEXT_CONTENT.thanks, centerX, y + size + (2 * fontScale), { align: 'center' });

  doc.setFontSize(5 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text(TEXT_CONTENT.brand, centerX, y + size + (6 * fontScale), { align: 'center' });
}

async function addCircleSticker(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  tagSlug: string
): Promise<void> {
  const printableSize = size + (BLEED * 2);
  const centerX = x + printableSize / 2;
  const centerY = y + printableSize / 2;
  const radius = size / 2;

  doc.setFillColor(...COLOR_BG_BLUE);
  doc.circle(centerX, centerY, radius, 'F');

  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.circle(centerX, centerY, radius, 'S');

  addBleedLine(doc, x, y, printableSize, printableSize, 'circle');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await generateQRCodeCached(qrUrl);

  const fontScale = size / 40;
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (14 * fontScale);

  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, qrY, qrSize, qrSize);

  addStickerText(doc, x, y, size, tagSlug);
}

async function addSquareSticker(
  doc: jsPDF,
  x: number,
  y: number,
  size: number,
  tagSlug: string
): Promise<void> {
  const printableSize = size + (BLEED * 2);
  const centerX = x + printableSize / 2;
  const centerY = y + printableSize / 2;
  const cornerRadius = 4;

  doc.setFillColor(...COLOR_BG_BLUE);
  doc.roundedRect(x + BLEED, y + BLEED, size, size, cornerRadius, cornerRadius, 'F');

  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.roundedRect(x + BLEED, y + BLEED, size, size, cornerRadius, cornerRadius, 'S');

  addBleedLine(doc, x, y, printableSize, printableSize, 'square');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await generateQRCodeCached(qrUrl);

  const fontScale = size / 40;
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (14 * fontScale);

  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, qrY, qrSize, qrSize);

  addStickerText(doc, x, y, size, tagSlug);
}

async function addRectangleSticker(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  tagSlug: string
): Promise<void> {
  const printableWidth = width + (BLEED * 2);
  const printableHeight = height + (BLEED * 2);
  const centerX = x + printableWidth / 2;
  const cornerRadius = 4;

  doc.setFillColor(...COLOR_BG_BLUE);
  doc.roundedRect(x + BLEED, y + BLEED, width, height, cornerRadius, cornerRadius, 'F');

  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.roundedRect(x + BLEED, y + BLEED, width, height, cornerRadius, cornerRadius, 'S');

  addBleedLine(doc, x, y, printableWidth, printableHeight, 'rectangle');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await generateQRCodeCached(qrUrl);

  const fontScale = height / 40;
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (14 * fontScale);

  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, qrY, qrSize, qrSize);

  addStickerText(doc, x, y, height, tagSlug);
}

async function addSticker(
  doc: jsPDF,
  x: number,
  y: number,
  shape: StickerShape,
  size: StickerSize,
  tagSlug: string
): Promise<void> {
  const dimensions = getStickerDimensions(shape, size);

  if (shape === 'circle') {
    await addCircleSticker(doc, x, y, dimensions.width, tagSlug);
  } else if (shape === 'square') {
    await addSquareSticker(doc, x, y, dimensions.width, tagSlug);
  } else {
    await addRectangleSticker(doc, x, y, dimensions.width, dimensions.height, tagSlug);
  }
}

// ============================================================================
// PDF GENERATION
// ============================================================================

export async function generateBundlePDF(bundleId: string) {
  if (!validateBundleId(bundleId)) {
    throw new Error('Invalid bundle ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const bundle = await db.query.tagBundles.findFirst({
    where: eq(tagBundles.id, bundleId),
    columns: {
      id: true,
      stickerShape: true,
      stickerSize: true,
    },
    with: {
      tags: {
        columns: { id: true, slug: true },
        orderBy: (tags, { asc }) => [asc(tags.slug)],
      },
    },
  });

  if (!bundle) {
    throw new Error('Bundle not found');
  }

  if (bundle.tags.length === 0) {
    throw new Error('Bundle has no tags');
  }

  const stickerShape = (bundle.stickerShape as StickerShape) || 'circle';
  const stickerSize = (bundle.stickerSize as StickerSize) || 'medium';
  const positions = calculateGridPositions(stickerShape, stickerSize);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  });

  addRegistrationMarks(doc);
  addHeaderBar(doc);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_GRAY);
  doc.text(`Bundle: ${bundle.id}`, 15, A3_HEIGHT - 10);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, A3_WIDTH - 15, A3_HEIGHT - 10, { align: 'right' });

  for (let i = 0; i < Math.min(positions.length, bundle.tags.length); i++) {
    const [x, y] = positions[i];
    const tag = bundle.tags[i];
    await addSticker(doc, x, y, stickerShape, stickerSize, tag.slug);
  }

  return doc.output('datauristring');
}
'use server';

import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
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

// Color constants (RGB)
const COLOR_BG_BLUE = [14, 165, 233] as const; // #0EA5E9
const COLOR_BORDER_BLUE = [3, 105, 161] as const; // #0369A1
const COLOR_WHITE = [255, 255, 255] as const; // #FFFFFF

// Registration mark positions (x, y dalam mm)
const REG_MARKS: [number, number][] = [
  [10, 10],   // Top left
  [A3_WIDTH - 10, 10],   // Top right
  [10, A3_HEIGHT - 10],  // Bottom left
  [A3_WIDTH - 10, A3_HEIGHT - 10],  // Bottom right
];

/**
 * Draw registration marks at corners
 */
function addRegistrationMarks(doc: jsPDF): void {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  REG_MARKS.forEach(([x, y]) => {
    // Draw circle registration mark (5mm diameter)
    doc.circle(x, y, 2.5, 'S');

    // Draw crosshair
    doc.line(x - 4, y, x + 4, y);
    doc.line(x, y - 4, x, y + 4);
  });
}

/**
 * Add header bar with title
 */
function addHeaderBar(doc: jsPDF): void {
  // Background bar biru
  doc.setFillColor(...COLOR_BG_BLUE);
  doc.rect(0, 20, A3_WIDTH, HEADER_HEIGHT, 'F');

  // Border bawah
  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(0.5);
  doc.line(0, 20 + HEADER_HEIGHT, A3_WIDTH, 20 + HEADER_HEIGHT);

  // Title text
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BALIKIN - Smart Lost & Found', A3_WIDTH / 2, 20 + HEADER_HEIGHT / 2 + 2, { align: 'center' });
}

/**
 * Draw bleed area (dashed circle/rect)
 */
function addBleedLine(doc: jsPDF, x: number, y: number, width: number, height: number, shape: StickerShape): void {
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([0.5, 0.5], 0);
  doc.setLineWidth(0.1);

  if (shape === 'circle') {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    doc.circle(centerX, centerY, radius, 'S');
  } else {
    // Square or rectangle
    doc.rect(x, y, width, height, 'S');
  }

  doc.setLineDashPattern([], 0); // Reset to solid
}

/**
 * Add a single circle sticker to the PDF
 */
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

  // Background biru lingkaran (sticker area)
  doc.setFillColor(...COLOR_BG_BLUE);
  doc.circle(centerX, centerY, radius, 'F');

  // Border lingkaran biru tua
  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.circle(centerX, centerY, radius, 'S');

  // Draw bleed line
  addBleedLine(doc, x, y, printableSize, printableSize, 'circle');

  // Generate QR Code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#1f2937', light: '#ffffff' }
  });

  // Scale font sizes based on sticker size
  const fontScale = size / 40; // 40mm is the base medium size

  // 1. ATAS - Pertanyaan bold
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(7 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('MENEMUKAN BARANG INI?', centerX, y + (10 * fontScale), { align: 'center' });

  // 2. TENGAH - QR Code dengan background putih
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (13 * fontScale);

  // White background untuk QR
  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, y + (14 * fontScale), qrSize, qrSize);

  // 3. BAWAH - Pesan empatik
  doc.setFontSize(6 * fontScale);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_WHITE);
  doc.text('Scan untuk hubungi pemilik.', centerX, y + size - (2 * fontScale), { align: 'center' });
  doc.text('Terima kasih orang baik!', centerX, y + size + (2 * fontScale), { align: 'center' });

  // 4. Branding kecil di paling bawah
  doc.setFontSize(5 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('[BALIKIN]', centerX, y + size + (6 * fontScale), { align: 'center' });
}

/**
 * Add a single square sticker to the PDF
 */
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
  const radius = size / 2;
  const cornerRadius = 4;

  // Background biru dengan rounded corners
  doc.setFillColor(...COLOR_BG_BLUE);
  doc.roundedRect(x + BLEED, y + BLEED, size, size, cornerRadius, cornerRadius, 'F');

  // Border biru tua
  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.roundedRect(x + BLEED, y + BLEED, size, size, cornerRadius, cornerRadius, 'S');

  // Draw bleed line
  addBleedLine(doc, x, y, printableSize, printableSize, 'square');

  // Generate QR Code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#1f2937', light: '#ffffff' }
  });

  // Scale font sizes based on sticker size
  const fontScale = size / 40;

  // 1. ATAS - Pertanyaan bold
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(7 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('MENEMUKAN BARANG INI?', centerX, y + (10 * fontScale), { align: 'center' });

  // 2. TENGAH - QR Code dengan background putih
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (13 * fontScale);

  // White background untuk QR
  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, y + (14 * fontScale), qrSize, qrSize);

  // 3. BAWAH - Pesan empatik
  doc.setFontSize(6 * fontScale);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_WHITE);
  doc.text('Scan untuk hubungi pemilik.', centerX, y + size - (2 * fontScale), { align: 'center' });
  doc.text('Terima kasih orang baik!', centerX, y + size + (2 * fontScale), { align: 'center' });

  // 4. Branding kecil di paling bawah
  doc.setFontSize(5 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('[BALIKIN]', centerX, y + size + (6 * fontScale), { align: 'center' });
}

/**
 * Add a single rectangle sticker to the PDF
 */
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

  // Background biru dengan rounded corners
  doc.setFillColor(...COLOR_BG_BLUE);
  doc.roundedRect(x + BLEED, y + BLEED, width, height, cornerRadius, cornerRadius, 'F');

  // Border biru tua
  doc.setDrawColor(...COLOR_BORDER_BLUE);
  doc.setLineWidth(1);
  doc.roundedRect(x + BLEED, y + BLEED, width, height, cornerRadius, cornerRadius, 'S');

  // Draw bleed line
  addBleedLine(doc, x, y, printableWidth, printableHeight, 'rectangle');

  // Generate QR Code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#1f2937', light: '#ffffff' }
  });

  // Scale font sizes based on sticker height
  const fontScale = height / 40;

  // 1. ATAS - Pertanyaan bold
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(7 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('MENEMUKAN BARANG INI?', centerX, y + (10 * fontScale), { align: 'center' });

  // 2. TENGAH - QR Code dengan background putih
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (13 * fontScale);

  // White background untuk QR
  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  // Add QR Code
  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, y + (14 * fontScale), qrSize, qrSize);

  // 3. BAWAH - Pesan empatik
  doc.setFontSize(6 * fontScale);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_WHITE);
  doc.text('Scan untuk hubungi pemilik.', centerX, y + height - (2 * fontScale), { align: 'center' });
  doc.text('Terima kasih orang baik!', centerX, y + height + (2 * fontScale), { align: 'center' });

  // 4. Branding kecil di paling bawah
  doc.setFontSize(5 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('[BALIKIN]', centerX, y + height + (6 * fontScale), { align: 'center' });
}

/**
 * Add a single sticker to the PDF based on shape
 */
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
    // rectangle
    await addRectangleSticker(doc, x, y, dimensions.width, dimensions.height, tagSlug);
  }
}

/**
 * Generate PDF for a tag bundle
 * Returns base64 data URL of the PDF
 */
export async function generateBundlePDF(bundleId: string) {
  // Admin check
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Fetch bundle with tags
  const bundle = await db.query.tagBundles.findFirst({
    where: eq(tagBundles.id, bundleId),
    with: {
      tags: {
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

  // Get template configuration with defaults for existing bundles
  const stickerShape = (bundle.stickerShape as StickerShape) || 'circle';
  const stickerSize = (bundle.stickerSize as StickerSize) || 'medium';

  // Calculate grid positions based on template
  const positions = calculateGridPositions(stickerShape, stickerSize);

  // Create A3 landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  });

  // Add registration marks
  addRegistrationMarks(doc);

  // Add header bar
  addHeaderBar(doc);

  // Add title info (footer)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(`Bundle: ${bundle.id}`, 15, A3_HEIGHT - 10);
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, A3_WIDTH - 15, A3_HEIGHT - 10, { align: 'right' });

  // Add stickers to grid positions
  for (let i = 0; i < positions.length && i < bundle.tags.length; i++) {
    const [x, y] = positions[i];
    const tag = bundle.tags[i];
    await addSticker(doc, x, y, stickerShape, stickerSize, tag.slug);
  }

  // Return PDF as data URL
  return doc.output('datauristring');
}

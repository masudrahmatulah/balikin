import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { getStickerDimensions } from '@/lib/sticker-template';
import type { StickerShape, StickerSize } from '@/lib/sticker-template';

const PAPER_DIMENSIONS = {
  a3: { landscape: [420, 297], portrait: [297, 420] },
  a4: { landscape: [297, 210], portrait: [210, 297] },
} as const;

// Color constants (RGB)
const COLOR_BG_BLUE = [14, 165, 233] as const;
const COLOR_BORDER_BLUE = [3, 105, 161] as const;
const COLOR_WHITE = [255, 255, 255] as const;
const BLEED = 2;

interface LayoutItem {
  id: string;
  tagId: string;
  tagSlug: string;
  x: number;
  y: number;
  rotation: number;
  shape: StickerShape;
  size: StickerSize;
  customText?: string;
}

interface GeneratePDFRequest {
  paperSize: 'a3' | 'a4';
  orientation: 'landscape' | 'portrait';
  items: LayoutItem[];
}

/**
 * Add registration marks at corners
 */
function addRegistrationMarks(doc: jsPDF, width: number, height: number): void {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  const REG_MARKS: [number, number][] = [
    [10, 10],
    [width - 10, 10],
    [10, height - 10],
    [width - 10, height - 10],
  ];

  REG_MARKS.forEach(([x, y]) => {
    doc.circle(x, y, 2.5, 'S');
    doc.line(x - 4, y, x + 4, y);
    doc.line(x, y - 4, x, y + 4);
  });
}

/**
 * Add a single sticker to the PDF
 */
async function addSticker(
  doc: jsPDF,
  item: LayoutItem
): Promise<void> {
  const { width, height } = getStickerDimensions(item.shape, item.size);
  const { x, y, rotation, tagSlug, shape, customText } = item;

  // Generate QR Code
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#1f2937', light: '#ffffff' }
  });

  // Save context for rotation
  doc.saveGraphicsState();

  // Translate to sticker center and rotate
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // jsPDF doesn't have native rotation support for content,
  // so we'll skip rotation for now or implement it differently
  // For rotation support, we'd need to use transformation matrices

  const fontScale = width / 40;

  if (shape === 'circle') {
    const radius = width / 2;

    // Background
    doc.setFillColor(...COLOR_BG_BLUE);
    doc.circle(centerX, centerY, radius, 'F');

    // Border
    doc.setDrawColor(...COLOR_BORDER_BLUE);
    doc.setLineWidth(1);
    doc.circle(centerX, centerY, radius, 'S');
  } else {
    const cornerRadius = 4;

    // Background with rounded corners
    doc.setFillColor(...COLOR_BG_BLUE);
    doc.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'F');

    // Border
    doc.setDrawColor(...COLOR_BORDER_BLUE);
    doc.setLineWidth(1);
    doc.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'S');
  }

  // Header text
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(7 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text(customText || 'MENEMUKAN BARANG INI?', centerX, y + (10 * fontScale), { align: 'center' });

  // QR Code with white background
  const qrSize = 20 * fontScale;
  const qrBgSize = 22 * fontScale;
  const qrX = centerX - qrBgSize / 2;
  const qrY = y + (13 * fontScale);

  doc.setFillColor(...COLOR_WHITE);
  doc.roundedRect(qrX, qrY, qrBgSize, qrBgSize, 2, 2, 'F');

  doc.addImage(qrDataUrl, 'PNG', centerX - qrSize / 2, y + (14 * fontScale), qrSize, qrSize);

  // Footer text
  doc.setFontSize(6 * fontScale);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLOR_WHITE);
  doc.text('Scan untuk hubungi pemilik.', centerX, y + height - (2 * fontScale), { align: 'center' });
  doc.text('Terima kasih orang baik!', centerX, y + height + (2 * fontScale), { align: 'center' });

  // Branding
  doc.setFontSize(5 * fontScale);
  doc.setFont('helvetica', 'bold');
  doc.text('[BALIKIN]', centerX, y + height + (6 * fontScale), { align: 'center' });

  // Restore context
  doc.restoreGraphicsState();
}

export async function POST(request: NextRequest) {
  try {
    // Admin check
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GeneratePDFRequest = await request.json();
    const { paperSize, orientation, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items to print' }, { status: 400 });
    }

    // Get paper dimensions
    const [width, height] = PAPER_DIMENSIONS[paperSize][orientation];

    // Create PDF
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize,
    });

    // Add registration marks
    addRegistrationMarks(doc, width, height);

    // Add header bar
    doc.setFillColor(...COLOR_BG_BLUE);
    doc.rect(0, 0, width, 20, 'F');

    doc.setTextColor(...COLOR_WHITE);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BALIKIN - Smart Lost & Found', width / 2, 13, { align: 'center' });

    // Add stickers
    for (const item of items) {
      await addSticker(doc, item);
    }

    // Footer info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 15, height - 10);

    // Generate PDF as data URL
    const pdfDataUrl = doc.output('datauristring');

    return NextResponse.json({ pdfUrl: pdfDataUrl });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

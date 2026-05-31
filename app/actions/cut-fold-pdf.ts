'use server';

import { eq } from 'drizzle-orm';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import { isAdmin } from '@/lib/admin';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { unstable_cache as cache } from 'next/cache';

// ============================================================================
// CONSTANTS (from design spec)
// ============================================================================

const A4_WIDTH = 210;
const A4_HEIGHT = 297;
const PAGE_MARGIN = 10;

const TAG_WIDTH = 60;
const TAG_HEIGHT = 37;
const QR_SIZE = 27;
const FOLD_POSITION = 30;
const GAP = 4;

const COLS = 3;
const ROWS = 7;
const TAGS_PER_PAGE = 21;

const COLOR_CUT_LINE = [150, 150, 150];
const COLOR_FOLD_LINE = [100, 100, 100];
const COLOR_TEXT_PRIMARY = [0, 0, 0];
const COLOR_TEXT_SECONDARY = [80, 80, 80];

const TEXT_LINE_1 = 'BANTU BALIKIN BARANG INI';
const TEXT_LINE_2 = 'Scan QR & Hubungi Pemiliknya';
const BRAND_TEXT = '[BALIKIN]';

// ============================================================================
// VALIDATION
// ============================================================================

const BATCH_ID_REGEX = /^[a-zA-Z0-9_-]{15,50}$/;

function validateBatchId(batchId: string): boolean {
  return BATCH_ID_REGEX.test(batchId);
}

// ============================================================================
// QR CODE GENERATION (CACHED)
// ============================================================================

async function generateQRCodeCached(qrUrl: string): Promise<string> {
  return cache(
    async () => {
      return toDataURL(qrUrl, {
        width: 300,
        margin: 0,
        errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#ffffff' }
      });
    },
    ['qr-code', qrUrl],
    { revalidate: 86400 }
  )();
}

// ============================================================================
// PDF DRAWING HELPERS
// ============================================================================

function addCuttingMarks(doc: jsPDF, x: number, y: number): void {
  doc.setDrawColor(...COLOR_CUT_LINE);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([], 0);
  doc.rect(x, y, TAG_WIDTH, TAG_HEIGHT, 'S');
}

function addFoldingMark(doc: jsPDF, x: number, y: number): void {
  doc.setDrawColor(...COLOR_FOLD_LINE);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([2, 2], 0);

  const foldX = x + FOLD_POSITION;
  doc.line(foldX, y, foldX, y + TAG_HEIGHT);

  doc.setLineDashPattern([], 0);
}

function addFrontContent(doc: jsPDF, x: number, y: number, qrDataUrl: string): void {
  const frontWidth = FOLD_POSITION;
  const frontCenterX = x + frontWidth / 2;

  const qrX = frontCenterX - QR_SIZE / 2;
  const qrY = y + 2;

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, QR_SIZE, QR_SIZE);

  const textAreaY = qrY + QR_SIZE + 2;
  const textAreaHeight = TAG_HEIGHT - (textAreaY - y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR_TEXT_PRIMARY);
  doc.text(TEXT_LINE_1, frontCenterX, textAreaY + 3, { align: 'center', maxWidth: frontWidth - 3 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text(TEXT_LINE_2, frontCenterX, textAreaY + 7, { align: 'center', maxWidth: frontWidth - 3 });
}

function addBackContent(doc: jsPDF, x: number, y: number): void {
  const backX = x + FOLD_POSITION;
  const backWidth = TAG_WIDTH - FOLD_POSITION;
  const backCenterX = backX + backWidth / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLOR_TEXT_PRIMARY);

  doc.text('BALIKIN', backCenterX, y + TAG_HEIGHT / 2 + 3, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COLOR_TEXT_SECONDARY);
  doc.text('Smart Lost & Found', backCenterX, y + TAG_HEIGHT / 2 + 7, { align: 'center' });
}

async function addCutFoldTag(doc: jsPDF, x: number, y: number, tagSlug: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${tagSlug}`;
  const qrDataUrl = await generateQRCodeCached(qrUrl);

  addCuttingMarks(doc, x, y);
  addFoldingMark(doc, x, y);
  addFrontContent(doc, x, y, qrDataUrl);
  addBackContent(doc, x, y);
}

function calculateGridPositions(pageIndex: number): Array<[number, number]> {
  const positions: Array<[number, number]> = [];

  const contentWidth = A4_WIDTH - (PAGE_MARGIN * 2);
  const contentHeight = A4_HEIGHT - (PAGE_MARGIN * 2);

  const totalGapX = (COLS - 1) * GAP;
  const totalGapY = (ROWS - 1) * GAP;

  const tagWidthWithGap = (contentWidth - totalGapX) / COLS;
  const tagHeightWithGap = (contentHeight - totalGapY) / ROWS;

  const startIndex = pageIndex * TAGS_PER_PAGE;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = startIndex + (row * COLS) + col;
      if (index >= startIndex + TAGS_PER_PAGE) break;

      const x = PAGE_MARGIN + col * (tagWidthWithGap + GAP);
      const y = PAGE_MARGIN + row * (tagHeightWithGap + GAP);

      positions.push([x, y]);
    }
  }

  return positions;
}

// ============================================================================
// PDF GENERATION
// ============================================================================

export async function generateCutFoldPDF(tagSlugs: string[]): Promise<string> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  if (tagSlugs.length === 0) {
    throw new Error('No tags provided');
  }

  const totalPages = Math.ceil(tagSlugs.length / TAGS_PER_PAGE);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let tagIndex = 0;

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      doc.addPage();
    }

    const positions = calculateGridPositions(page);

    for (const [x, y] of positions) {
      if (tagIndex >= tagSlugs.length) break;

      await addCutFoldTag(doc, x, y, tagSlugs[tagIndex]);
      tagIndex++;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_TEXT_SECONDARY);
    doc.text(
      `Page ${page + 1} of ${totalPages} | Generated: ${new Date().toLocaleString('id-ID')}`,
      A4_WIDTH / 2,
      A4_HEIGHT - 3,
      { align: 'center' }
    );
  }

  return doc.output('datauristring');
}

export async function generateCutFoldPDFByBatchId(batchId: string): Promise<string> {
  if (!validateBatchId(batchId)) {
    throw new Error('Invalid batch ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const batchTags = await db.query.tags.findMany({
    where: eq(tags.bundleId, batchId),
    columns: { id: true, slug: true },
    orderBy: (tags, { asc }) => [asc(tags.slug)],
  });

  if (batchTags.length === 0) {
    throw new Error('Batch has no tags');
  }

  const tagSlugs = batchTags.map(tag => tag.slug);
  return generateCutFoldPDF(tagSlugs);
}

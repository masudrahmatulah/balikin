'use server';

import { eq, like } from 'drizzle-orm';
import { toDataURL } from 'qrcode';
import { isAdmin } from '@/lib/admin';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { unstable_cache as cache } from 'next/cache';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { calculateGridPositions, type PaperSize } from '@/lib/sticker-template';

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_PAPER_SIZE: PaperSize = 'a3';
const DEFAULT_SHAPE = 'circle';
const DEFAULT_SIZE = 'medium';

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
// PDF GENERATION
// ============================================================================

export async function generateCutFoldPDF(
  tagSlugs: string[],
  paperSize: PaperSize = DEFAULT_PAPER_SIZE
): Promise<Uint8Array> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  if (tagSlugs.length === 0) {
    throw new Error('No tags provided');
  }

  // Calculate items per sheet dynamically based on paper size
  const gridPositions = calculateGridPositions(DEFAULT_SHAPE, DEFAULT_SIZE, paperSize, 'landscape');
  const tagsPerPage = gridPositions.length;
  const totalPages = Math.ceil(tagSlugs.length / tagsPerPage);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://balikin.id';

  // Generate QR codes for all tags
  const tags = await Promise.all(
    tagSlugs.map(async (slug) => {
      const qrUrl = `${baseUrl}/p/${slug}`;
      const qrDataUrl = await generateQRCodeCached(qrUrl);
      return { slug, qrDataUrl };
    })
  );

  // Dynamically import React PDF component
  const { CutFoldPDFDocument } = await import('@/components/admin/cut-fold-pdf-document');

  // Generate PDF using React component with all pages
  const pdfBlob = await pdf(
    React.createElement(CutFoldPDFDocument, {
      tags,
      totalPages,
      baseUrl,
      paperSize,
    })
  ).toBlob();

  // Convert blob to Uint8Array
  const arrayBuffer = await pdfBlob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export async function generateCutFoldPDFByBatchId(
  batchId: string,
  paperSize: PaperSize = DEFAULT_PAPER_SIZE
): Promise<Uint8Array> {
  if (!validateBatchId(batchId)) {
    throw new Error('Invalid batch ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const batchTags = await db.query.tags.findMany({
    where: like(tags.slug, `${batchId}-%`),
    columns: { id: true, slug: true },
    orderBy: (tags, { asc }) => [asc(tags.slug)],
  });

  if (batchTags.length === 0) {
    throw new Error('Batch has no tags');
  }

  const tagSlugs = batchTags.map(tag => tag.slug);
  return generateCutFoldPDF(tagSlugs, paperSize);
}

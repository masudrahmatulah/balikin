/**
 * VDP Engine (Variable Data Printing) for Balikin Physical Production
 * 6-Column Layout: 2 Packets × 3 Columns (QR Utama, Logo, QR Aktivasi)
 * Using Sharp for compositing with explicit pixel coordinates
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import pLimit from 'p-limit';

// ============================================================================
// CONSTANTS (300 DPI: 1 mm = 11.81 pixels)
// ============================================================================

// Lebar per kotak = 30mm * 11.81 = 354px
// Tinggi per kotak = 45mm * 11.81 = 531px
const KOTAK_WIDTH = 354;
const KOTAK_HEIGHT = 531;
const KANVAS_WIDTH = KOTAK_WIDTH * 6; // 2124px (6 Kotak Horizontal)
const KANVAS_HEIGHT = KOTAK_HEIGHT;   // 531px

// ============================================================================
// TYPES
// ============================================================================

export interface TagData {
  productSlug: string;
  activationTokenHash: string;
  activationPinPlain: string;
  serialNumber: string;
  name?: string;
  id?: string;
}

export interface TagVDPData extends TagData {
  id: string;
  slug: string;
  isCustom: boolean;
  name: string;
  customPhotoUrl?: string;
}

export interface PrintBatchData {
  id: string;
  batchNumber: string;
  totalStickers: number;
  status: string;
}

export interface VDPOptions {
  isReprint?: boolean;
  includeActivation?: boolean;
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

const renderQueue = pLimit(3);

// ============================================================================
// LOGO BUFFER (Lazy loaded)
// ============================================================================

let logoBufferCache: Buffer | null = null;

async function getLogoBuffer(): Promise<Buffer> {
  if (logoBufferCache) return logoBufferCache;

  // Default logo - create a simple SVG logo
  const logoSvg = Buffer.from(`
    <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="220" fill="#0EA5E9"/>
      <text x="110" y="90" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">BALIKIN</text>
      <text x="110" y="120" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Smart Lost &amp; Found</text>
      <circle cx="110" cy="160" r="20" fill="white"/>
      <circle cx="110" cy="155" r="8" fill="#0EA5E9"/>
    </svg>
  `);

  logoBufferCache = await sharp(logoSvg).resize(220, 220).png().toBuffer();
  return logoBufferCache;
}

// ============================================================================
// CUSTOM PHOTO FETCHER (Vercel Blob)
// ============================================================================

async function getCustomPhotoBuffer(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch photo: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    // Resize to match logo size (220x220)
    return await sharp(buffer).resize(220, 220).png().toBuffer();
  } catch (error) {
    console.error('Error fetching custom photo:', error);
    // Return logo as fallback
    return await getLogoBuffer();
  }
}

// ============================================================================
// TEXT SVG GENERATION
// ============================================================================

function drawTextSvg(pin: string, serial: string, isAktivasi = false): Buffer {
  return Buffer.from(`
    <svg width="${KOTAK_WIDTH}" height="${KOTAK_HEIGHT}">
      <style>
        .serial { font-family: sans-serif; font-size: 6pt; fill: #475569; }
        .title { font-family: sans-serif; font-size: 16px; fill: #1e293b; font-weight: bold; text-anchor: middle; }
        .pin { font-family: sans-serif; font-size: 18px; fill: #ef4444; font-weight: bold; text-anchor: middle; }
        .scan-label { font-family: sans-serif; font-size: 12px; fill: #64748b; font-weight: bold; text-anchor: middle; }
      </style>
      ${isAktivasi ? `
        <text x="${KOTAK_WIDTH / 2}" y="30" class="scan-label">SCAN UNTUK AKTIVASI</text>
        <text x="${KOTAK_WIDTH / 2}" y="480" class="pin">PIN: ${pin}</text>
      ` : ''}
      <text x="20" y="${KOTAK_HEIGHT - 15}" class="serial">${serial}</text>
    </svg>
  `);
}

// ============================================================================
// MAIN ROW GENERATION FUNCTION
// ============================================================================

/**
 * Generate one row of stickers with consistent 3-column layout per packet
 *
 * PAKET LAYOUT (3 kolom per paket):
 * - Kolom 1: QR Utama (untuk scan jika barang ditemukan/hilang)
 * - Kolom 2: Logo Balikin atau Foto Kustom
 * - Kolom 3: QR Aktivasi (untuk aktivasi setelah barang diterima)
 *
 * Untuk pesanan massal: QR Utama + Logo + QR Aktivasi
 * Untuk pesanan custom: QR Utama + Foto + QR Aktivasi (tetap 3 kolom)
 */
export async function generateOneRowSticker(
  tagA: TagVDPData,
  tagB: TagVDPData | null
): Promise<Buffer> {
  // FIXED: Setiap paket selalu 3 kolom (3 × 354px = 1062px per paket)
  const PACKET_COLS = 3;
  const numPackets = tagB ? 2 : 1;
  const canvasWidth = numPackets * PACKET_COLS * KOTAK_WIDTH; // 2124px untuk 2 paket

  // 1. Buat Kanvas Latar Belakang Putih
  const background = sharp({
    create: {
      width: canvasWidth,
      height: KANVAS_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  const layers: sharp.OverlayOptions[] = [];

  // ========================================
  // PAKET 1 (3 Kolom: QR Utama + Logo/Foto + QR Aktivasi)
  // ========================================

  // Paket 1 - Kolom 1: QR Utama (scan jika barang ditemukan)
  const qrUtamaA = await QRCode.toBuffer(
    `https://balikin.id/p/${tagA.slug}`,
    { width: 220, margin: 1 }
  );
  const textSvgA = drawTextSvg(tagA.activationPinPlain || '', tagA.serialNumber || '', false);

  layers.push(
    { input: qrUtamaA, top: 120, left: 67 }, // QR di tengah kotak (30mm padding)
    { input: textSvgA, top: 0, left: 0 }      // Text overlay untuk serial number
  );

  // Paket 1 - Kolom 2: Logo Balikin atau Foto Kustom
  if (tagA.isCustom && tagA.customPhotoUrl) {
    // Custom order: Gunakan foto kustom
    const customPhoto = await getCustomPhotoBuffer(tagA.customPhotoUrl);
    layers.push(
      { input: customPhoto, top: 120, left: KOTAK_WIDTH + 67 },
      { input: textSvgA, top: 0, left: KOTAK_WIDTH }
    );
  } else {
    // Massal order: Gunakan logo Balikin
    const logoResized = await sharp(await getLogoBuffer()).resize(220, 220).toBuffer();
    layers.push(
      { input: logoResized, top: 120, left: KOTAK_WIDTH + 67 },
      { input: textSvgA, top: 0, left: KOTAK_WIDTH }
    );
  }

  // Paket 1 - Kolom 3: QR Aktivasi (untuk aktivasi barang)
  // DEBUG: Log activation token hash
  console.log('[VDP] Tag A activationTokenHash:', tagA.activationTokenHash);
  console.log('[VDP] Tag A slug:', tagA.slug);
  console.log('[VDP] Tag A isCustom:', tagA.isCustom);

  const qrAktivasiA = await QRCode.toBuffer(
    `https://balikin.id/activate?slug=${tagA.slug}&token=${tagA.activationTokenHash || ''}`,
    { width: 220, margin: 1 }
  );
  const textSvgAktivasiA = drawTextSvg(tagA.activationPinPlain || '', tagA.serialNumber || '', true);

  layers.push(
    { input: qrAktivasiA, top: 150, left: (KOTAK_WIDTH * 2) + 67 },
    { input: textSvgAktivasiA, top: 0, left: KOTAK_WIDTH * 2 }
  );

  // ========================================
  // PAKET 2 (jika ada) - 3 Kolom sama seperti Paket 1
  // ========================================

  if (tagB) {
    const offsetA = PACKET_COLS * KOTAK_WIDTH; // Offset setelah Paket 1 (1062px)

    // Paket 2 - Kolom 1: QR Utama
    const qrUtamaB = await QRCode.toBuffer(
      `https://balikin.id/p/${tagB.slug}`,
      { width: 220, margin: 1 }
    );
    const textSvgB = drawTextSvg(tagB.activationPinPlain || '', tagB.serialNumber || '', false);

    layers.push(
      { input: qrUtamaB, top: 120, left: offsetA + 67 },
      { input: textSvgB, top: 0, left: offsetA }
    );

    // Paket 2 - Kolom 2: Logo Balikin atau Foto Kustom
    if (tagB.isCustom && tagB.customPhotoUrl) {
      const customPhoto = await getCustomPhotoBuffer(tagB.customPhotoUrl);
      layers.push(
        { input: customPhoto, top: 120, left: offsetA + KOTAK_WIDTH + 67 },
        { input: textSvgB, top: 0, left: offsetA + KOTAK_WIDTH }
      );
    } else {
      const logoResized = await sharp(await getLogoBuffer()).resize(220, 220).toBuffer();
      layers.push(
        { input: logoResized, top: 120, left: offsetA + KOTAK_WIDTH + 67 },
        { input: textSvgB, top: 0, left: offsetA + KOTAK_WIDTH }
      );
    }

    // Paket 2 - Kolom 3: QR Aktivasi
    const qrAktivasiB = await QRCode.toBuffer(
      `https://balikin.id/activate?slug=${tagB.slug}&token=${tagB.activationTokenHash || ''}`,
      { width: 220, margin: 1 }
    );
    const textSvgAktivasiB = drawTextSvg(tagB.activationPinPlain || '', tagB.serialNumber || '', true);

    layers.push(
      { input: qrAktivasiB, top: 150, left: offsetA + (KOTAK_WIDTH * 2) + 67 },
      { input: textSvgAktivasiB, top: 0, left: offsetA + KOTAK_WIDTH * 2 }
    );
  }

  // Eksekusi compositing
  console.log('[VDP] Total layers to composite:', layers.length);
  console.log('[VDP] Canvas width:', canvasWidth, 'height:', KANVAS_HEIGHT);

  // DEBUG: Log setiap layer position
  layers.forEach((layer, index) => {
    console.log(`[VDP] Layer ${index}: top=${layer.top}, left=${layer.left}`);
  });

  const result = await background.composite(layers).png().toBuffer();
  console.log('[VDP] Generated PNG buffer size:', result.length);

  return result;
}

// ============================================================================
// STREAM GENERATION
// ============================================================================

/**
 * Generate PNG stream for a batch of tags
 * Yields PNG buffers one row at a time (2 tags per row)
 */
export async function* generateVDPStream(
  tags: TagVDPData[],
  options: VDPOptions = {}
): AsyncGenerator<Buffer, void, unknown> {
  for (let i = 0; i < tags.length; i += 2) {
    const tagA: TagVDPData = {
      id: tags[i].id,
      slug: tags[i].slug,
      activationTokenHash: tags[i].activationTokenHash || '',
      activationPinPlain: tags[i].activationPinPlain || '',
      serialNumber: tags[i].serialNumber || '',
      isCustom: tags[i].isCustom || false,
      name: tags[i].name,
      customPhotoUrl: tags[i].customPhotoUrl,
    };

    const tagB = tags[i + 1] ? {
      id: tags[i + 1].id,
      slug: tags[i + 1].slug,
      activationTokenHash: tags[i + 1].activationTokenHash || '',
      activationPinPlain: tags[i + 1].activationPinPlain || '',
      serialNumber: tags[i + 1].serialNumber || '',
      isCustom: tags[i + 1].isCustom || false,
      name: tags[i + 1].name,
      customPhotoUrl: tags[i + 1].customPhotoUrl,
    } : null;

    const buffer = await renderQueue(() => generateOneRowSticker(tagA, tagB));
    yield buffer;
  }
}

// ============================================================================
// BATCH REPRINT
// ============================================================================

/**
 * Generate stream for reprinting existing batch
 */
export async function* generateBatchReprint(
  batchId: string,
  db: any
): AsyncGenerator<Buffer, void, unknown> {
  const batch = await db.query.printBatches.findFirst({
    where: { id: batchId },
    with: {
      tags: {
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          activationPinPlain: true,
          activationTokenHash: true,
          isCustom: true,
          customPhotoUrl: true,
          name: true
        },
        orderBy: (tags: any, { asc }) => [asc(tags.slug)]
      }
    }
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const tags: TagVDPData[] = batch.tags.map((tag: any) => ({
    id: tag.id,
    slug: tag.slug,
    serialNumber: tag.serialNumber || undefined,
    activationPinPlain: tag.activationPinPlain || undefined,
    activationTokenHash: tag.activationTokenHash || undefined,
    isCustom: tag.isCustom || false,
    customPhotoUrl: tag.customPhotoUrl || undefined,
    name: tag.name
  }));

  yield* generateVDPStream(tags, { isReprint: true });
}

// ============================================================================
// TOKEN GENERATION
// ============================================================================

import { hashValue, generateActivationToken, generateActivationPin, generateSerialNumber } from './crypto';

/**
 * Generate activation tokens and PINs for a batch of tags
 */
export function generateBatchActivationData(count: number, batchNumber: string): Array<{
  activationToken: string;
  activationTokenHash: string;
  activationPinHash: string;
  activationPinPlain: string;
  serialNumber: string;
}> {
  const results = [];

  for (let i = 0; i < count; i++) {
    const token = generateActivationToken();
    const pin = generateActivationPin();
    const serial = generateSerialNumber(batchNumber, i + 1);

    results.push({
      activationToken: token,
      activationTokenHash: hashValue(token),
      activationPinHash: hashValue(pin),
      activationPinPlain: pin,
      serialNumber: serial
    });
  }

  return results;
}

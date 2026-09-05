/**
 * VDP Engine (Variable Data Printing) for Balikin Physical Production
 * 4-Column Layout: 2 Packets × 2 Columns (QR Utama, Logo/Foto)
 * Token aktivasi tetap disimpan di DB dan dikirim manual via email/WA.
 * Using Sharp for compositing with explicit pixel coordinates
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import pLimit from 'p-limit';
import { openSync as fontkitOpenSync } from 'fontkit';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  type AcrylicShapeKey,
  deriveAcrylicShapeKey,
  getAcrylicShapeConfig,
  getShapeMarkup,
  mmToPx,
} from './acrylic-shapes';

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

// Cached at a resolution large enough for the biggest shape's QR box
// (rectangle-emboss: 26mm ~ 307px) so per-shape downscaling stays crisp.
const LOGO_CACHE_SIZE = 400;

async function getLogoBuffer(): Promise<Buffer> {
  if (logoBufferCache) return logoBufferCache;

  // Default logo - Balikin's real brand mark, letterboxed onto a white square
  // so its non-square aspect ratio isn't stretched when composited into the QR box.
  const logoPath = path.join(process.cwd(), 'public', 'balikin_logo.png');
  const rawLogo = await readFile(logoPath);
  logoBufferCache = await sharp(rawLogo)
    .resize(LOGO_CACHE_SIZE, LOGO_CACHE_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
  return logoBufferCache;
}

// ============================================================================
// EMBEDDED FONT (serverless-safe text rendering)
// ============================================================================

// Vercel serverless tidak punya font sistem (tanpa DejaVu/Arial), sehingga
// SVG <text> yang diraster Sharp/librsvg tampil sebagai kotak-kotak
// (librsvg di sini juga mengabaikan @font-face). Solusi: render semua teks
// sebagai path vektor via fontkit memakai DejaVu Sans yang dibundel di
// lib/fonts — deterministik di environment mana pun.
let vdpFontRegular: any = null;
let vdpFontBold: any = null;

function getVdpFont(bold: boolean): any {
  if (bold) {
    if (!vdpFontBold) {
      vdpFontBold = fontkitOpenSync(
        path.join(process.cwd(), 'lib', 'fonts', 'DejaVuSans-Bold.ttf')
      );
    }
    return vdpFontBold;
  }
  if (!vdpFontRegular) {
    vdpFontRegular = fontkitOpenSync(
      path.join(process.cwd(), 'lib', 'fonts', 'DejaVuSans.ttf')
    );
  }
  return vdpFontRegular;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Render satu baris teks rata-tengah sebagai grup path SVG.
 * `y` adalah baseline (sama konvensinya dengan atribut y pada <text>).
 */
function renderTextPaths(
  text: string,
  cx: number,
  y: number,
  fontSizePx: number,
  fill: string,
  bold = false,
  trackingPx = 0
): string {
  if (!text) return '';
  const font = getVdpFont(bold);
  const scale = fontSizePx / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = run.glyphs as any[];
  const positions = (run as any).positions as Array<{ xAdvance: number }> | undefined;
  // `pen` dalam px output (transform SVG: translate dulu lalu scale,
  // sehingga offset translate harus sudah dalam px, bukan unit font).
  let pen = 0;
  const parts: string[] = [];
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const d = g.path ? g.path.toSVG() : '';
    if (d) {
      parts.push(`<g transform="translate(${r2(pen)} 0) scale(${r2(scale)} ${r2(-scale)})"><path d="${d}"/></g>`);
    }
    const advUnits = positions && positions[i] ? positions[i].xAdvance : g.advanceWidth;
    pen += advUnits * scale;
    if (i < glyphs.length - 1) pen += trackingPx;
  }
  const totalWidth = pen;
  const startX = cx - totalWidth / 2;
  return `<g fill="${fill}" transform="translate(${r2(startX)} ${r2(y)})">${parts.join('')}</g>`;
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
    return await sharp(buffer).resize(LOGO_CACHE_SIZE, LOGO_CACHE_SIZE).png().toBuffer();
  } catch (error) {
    console.error('Error fetching custom photo:', error);
    // Return logo as fallback
    return await getLogoBuffer();
  }
}

function bufferToDataUri(buf: Buffer): string {
  return `data:image/png;base64,${buf.toString('base64')}`;
}

// ============================================================================
// KOTAK (single die-cut cell) SVG GENERATION
// ============================================================================

interface KotakOptions {
  shapeKey: AcrylicShapeKey | null;
  contentDataUri: string;
  serial: string;
  pin?: string;
  isAktivasi: boolean;
  topLabel?: string;
  bottomLabel?: string;
  contentWidthMm?: number;
  contentHeightMm?: number;
}

/**
 * Renders one QR/logo cell as a single SVG: background + content are clipped
 * to the wadah's die-cut outline (so nothing bleeds past the cut line), and
 * the same outline is redrawn unclipped as the cutting-mark stroke.
 */
function buildKotakSvg({ shapeKey, contentDataUri, serial, pin, isAktivasi, topLabel, bottomLabel, contentWidthMm, contentHeightMm }: KotakOptions): Buffer {
  const config = getAcrylicShapeConfig(shapeKey);
  const widthPx = mmToPx(config.widthMm);
  const heightPx = mmToPx(config.heightMm);
  const contentWidthPx = mmToPx(contentWidthMm ?? config.qrSizeMm);
  const contentHeightPx = mmToPx(contentHeightMm ?? config.qrSizeMm);
  const topMarginPx = mmToPx(config.qrTopMarginMm);
  const shapeTag = getShapeMarkup(config.maskType, widthPx, heightPx);
  const clipId = `clip${Math.random().toString(36).slice(2, 10)}`;

  // Kolom QR akrilik: judul besar di atas + caption di bawah QR.
  // Font diskala dari lebar cell agar mudah terbaca di semua bentuk
  // (kecil seperti square/circle maupun tinggi seperti octagon/rectangle).
  // Bentuk lengkung (heart/circle/octagon) menyempit di tepi atas-bawah,
  // jadi judul/caption digeser ke dalam agar tidak menabrak garis potong.
  const hasQrLabels = !isAktivasi && !!topLabel && !!bottomLabel;
  const baseTopFontPx = Math.min(30, Math.max(17, Math.round(widthPx * 0.072)));
  const baseBottomFontPx = Math.min(18, Math.max(12, Math.round(widthPx * 0.05)));
  const topFontPx = config.maskType === 'heart'
    ? Math.min(baseTopFontPx, 22)
    : config.maskType === 'circle'
      ? Math.min(baseTopFontPx, 24)
      : baseTopFontPx;
  const bottomFontPx = config.maskType === 'heart'
    ? Math.min(baseBottomFontPx, 14)
    : baseBottomFontPx;
  const maskExtraTopPx = config.maskType === 'heart' ? 26 : config.maskType === 'circle' ? 12 : config.maskType === 'octagon' ? 14 : 0;
  const maskExtraBottomPx = config.maskType === 'heart' ? 38 : config.maskType === 'circle' ? 10 : config.maskType === 'octagon' ? 10 : 0;
  const topReservePx = hasQrLabels ? topFontPx + 12 + maskExtraTopPx : 0;
  const bottomReservePx = hasQrLabels ? bottomFontPx + 22 + maskExtraBottomPx : 0;

  let contentX: number;
  let contentY: number;
  let displayWidthPx: number;
  let displayHeightPx: number;
  if (hasQrLabels) {
    // Sisakan ruang atas & bawah untuk teks, lalu muatkan QR di antaranya.
    // Jika QR config lebih tinggi dari ruang tersedia, kecilkan tampilan
    // (downscale) agar tidak menabrak judul/caption/garis potong.
    const availableH = Math.max(50, heightPx - topReservePx - bottomReservePx);
    const scale = Math.min(1, availableH / contentHeightPx);
    displayWidthPx = Math.round(contentWidthPx * scale);
    displayHeightPx = Math.round(contentHeightPx * scale);
    contentX = (widthPx - displayWidthPx) / 2;
    contentY = topReservePx + Math.max(0, (availableH - displayHeightPx) / 2);
  } else {
    // Center the QR/logo vertically in the die-cut shape rather than hugging the
    // curvature-safety top margin. Aktivasi cells additionally reserve space
    // below for the PIN + serial text (pinText/serialText below), so their
    // centering is capped to whatever leaves that text room.
    displayWidthPx = contentWidthPx;
    displayHeightPx = contentHeightPx;
    contentX = (widthPx - displayWidthPx) / 2;
    const verticalCenterPx = (heightPx - displayHeightPx) / 2;
    const BOTTOM_TEXT_RESERVE_PX = 41; // gap to PIN (22) + PIN line + min gap to serial
    const maxAktivasiContentY = heightPx - displayHeightPx - BOTTOM_TEXT_RESERVE_PX;
    contentY = isAktivasi
      ? Math.max(topMarginPx, Math.min(verticalCenterPx, maxAktivasiContentY))
      : Math.max(topMarginPx, verticalCenterPx);
  }

  const labelText = isAktivasi
    ? renderTextPaths('AKTIVASI', widthPx / 2, Math.max(topMarginPx - 6, 10), 9, '#7c3aed', true)
    : hasQrLabels
      ? renderTextPaths(topLabel as string, widthPx / 2, topReservePx - 6, topFontPx, '#111111', true, 0.5)
      : topLabel
        ? renderTextPaths(topLabel, widthPx / 2, Math.max(topMarginPx - 6, 10), 8, '#1f2937', true)
        : '';

  const pinText = pin
    ? renderTextPaths(`PIN: ${pin}`, widthPx / 2, Math.min(contentY + displayHeightPx + 22, heightPx - 8), 13, '#ef4444', true)
    : hasQrLabels
      ? renderTextPaths(bottomLabel as string, widthPx / 2, Math.min(contentY + displayHeightPx + bottomFontPx + 6, heightPx - 10), bottomFontPx, '#111111', true)
      : bottomLabel
        ? renderTextPaths(bottomLabel, widthPx / 2, Math.min(contentY + displayHeightPx + 16, heightPx - 8), 7, '#4b5563', false)
        : '';

  const serialText = renderTextPaths(serial, widthPx / 2, heightPx - 4, 6.5, '#94a3b8', false);

  const svg = `
    <svg width="${widthPx}" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="${clipId}">${shapeTag}/></clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        <rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="#ffffff"/>
        <image href="${contentDataUri}" x="${contentX}" y="${contentY}" width="${displayWidthPx}" height="${displayHeightPx}" preserveAspectRatio="xMidYMid meet"/>
      </g>
      ${shapeTag} fill="none" stroke="#9ca3af" stroke-width="1.5"/>
      ${labelText}
      ${pinText}
      ${serialText}
    </svg>
  `;

  return Buffer.from(svg);
}

// ============================================================================
// MAIN ROW GENERATION FUNCTION
// ============================================================================

/**
 * Generate one row of stickers with consistent 2-column layout per packet
 *
 * PAKET LAYOUT (2 kolom per paket):
 * - Kolom 1: QR Utama (untuk scan jika barang ditemukan/hilang)
 * - Kolom 2: Logo Balikin atau Foto Kustom
 *
 * Untuk pesanan massal: QR Utama + Logo
 * Untuk pesanan custom: QR Utama + Foto (tetap 2 kolom)
 * Token aktivasi tidak dicetak; dikirim manual via email/WA dan
 * diminta pada scan pertama.
 */
export async function generateOneRowSticker(
  tagA: TagVDPData,
  tagB: TagVDPData | null,
  shapeKey: AcrylicShapeKey | null = null
): Promise<Buffer> {
  const config = getAcrylicShapeConfig(shapeKey);
  const kotakWidthPx = mmToPx(config.widthMm);
  const kotakHeightPx = mmToPx(config.heightMm);
  const qrSizePx = mmToPx(config.qrSizeMm);

  const PACKET_COLS = 2;
  const numPackets = tagB ? 2 : 1;
  const canvasWidth = numPackets * PACKET_COLS * kotakWidthPx;

  const background = sharp({
    create: {
      width: canvasWidth,
      height: kotakHeightPx,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  const layers: sharp.OverlayOptions[] = [];

  async function buildPacket(tag: TagVDPData, offsetLeftPx: number) {
    // Kolom 1: QR Utama (scan jika barang ditemukan)
    const qrUtamaDataUri = await QRCode.toDataURL(
      `https://balikin.id/p/${tag.slug}`,
      { width: qrSizePx, margin: 1 }
    );
    // Kolom kiri (QR): judul besar SCAN DISINI + caption di bawah QR.
    // Berlaku untuk semua varian akrilik; kolom kanan (logo) tetap polos.
    const kotak1 = await sharp(buildKotakSvg({
      shapeKey,
      contentDataUri: qrUtamaDataUri,
      serial: tag.serialNumber || '',
      isAktivasi: false,
      topLabel: 'SCAN DISINI',
      bottomLabel: 'Untuk Hubungi Pemiliknya',
    })).png().toBuffer();
    layers.push({ input: kotak1, top: 0, left: offsetLeftPx });

    // Kolom 2: Logo Balikin atau Foto Kustom (bisa punya ukuran sendiri agar
    // lebih mendekati sisi kotak dibanding QR - lihat logoWidthMm/logoHeightMm)
    const logoWidthPx = mmToPx(config.logoWidthMm ?? config.qrSizeMm);
    const logoHeightPx = mmToPx(config.logoHeightMm ?? config.qrSizeMm);
    const rawContentBuffer = tag.isCustom && tag.customPhotoUrl
      ? await getCustomPhotoBuffer(tag.customPhotoUrl)
      : await getLogoBuffer();
    const contentDataUri = bufferToDataUri(
      await sharp(rawContentBuffer)
        .resize(logoWidthPx, logoHeightPx, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer()
    );
    const kotak2 = await sharp(buildKotakSvg({
      shapeKey,
      contentDataUri,
      serial: tag.serialNumber || '',
      isAktivasi: false,
      contentWidthMm: config.logoWidthMm,
      contentHeightMm: config.logoHeightMm,
    })).png().toBuffer();
    layers.push({ input: kotak2, top: 0, left: offsetLeftPx + kotakWidthPx });
  }

  await buildPacket(tagA, 0);
  if (tagB) {
    await buildPacket(tagB, PACKET_COLS * kotakWidthPx);
  }

  return background.composite(layers).png().toBuffer();
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
  shapeKey: AcrylicShapeKey | null = null,
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

    const buffer = await renderQueue(() => generateOneRowSticker(tagA, tagB, shapeKey));
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
          name: true,
          productType: true
        },
        orderBy: (tags: any, { asc }) => [asc(tags.slug)]
      }
    }
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const shapeKey = deriveAcrylicShapeKey(batch.tags[0]?.productType);

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

  yield* generateVDPStream(tags, shapeKey, { isReprint: true });
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

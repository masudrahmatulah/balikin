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
  /** Pasang per row PNG: 2 (default) atau 3 (A5 bila muat skala 1:1). */
  pairsPerRow?: 2 | 3;
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

  // Default logo - Balikin's real brand mark, letterboxed onto a transparent
  // square so its aspect ratio isn't stretched; transparansi dijaga agar
  // step fill-blur di bawah memakai gambar murni (tanpa bar putih).
  const logoPath = path.join(process.cwd(), 'public', 'balikin_logo.png');
  const rawLogo = await readFile(logoPath);
  logoBufferCache = await sharp(rawLogo)
    .resize(LOGO_CACHE_SIZE, LOGO_CACHE_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return logoBufferCache;
}

/**
 * Totop gambar ke kotak W×H: background = gambar yang sama di-cover + blur
 * mengisi penuh (tanpa area kosong), foreground = gambar utuh (contain) di
 * tengah. Logo/foto selalu nampak keseluruhan.
 */
export async function fitContainWithFill(
  rawContent: Buffer,
  widthPx: number,
  heightPx: number
): Promise<Buffer> {
  const [bg, fg] = await Promise.all([
    sharp(rawContent)
      .resize(widthPx, heightPx, { fit: 'cover', position: 'center' })
      .blur(25)
      .toBuffer(),
    sharp(rawContent)
      .resize(widthPx, heightPx, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer(),
  ]);
  return sharp({
    create: {
      width: widthPx,
      height: heightPx,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: bg }, { input: fg }])
    .png()
    .toBuffer();
}

let rawLogoBufferCache: Buffer | null = null;

// Logo mentah tanpa padding kotak: dipakai sel full-bleed (kolom 2
// rectangle-emboss, 30x45) agar tidak ada bar putih ganda dari cache square
// yang di-resize lagi ke box portrait.
async function getRawLogoBuffer(): Promise<Buffer> {
  if (rawLogoBufferCache) return rawLogoBufferCache;
  rawLogoBufferCache = await readFile(path.join(process.cwd(), 'public', 'balikin_logo.png'));
  return rawLogoBufferCache;
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
let vdpFontDisplay: any = null;
let vdpFontBodyRegular: any = null;
let vdpFontBodyBold: any = null;

type VdpFontRole = 'legacy' | 'display' | 'body';

function getVdpFont(bold: boolean, role: VdpFontRole = 'legacy'): any {
  if (role === 'display') {
    if (!vdpFontDisplay) {
      try {
        vdpFontDisplay = fontkitOpenSync(
          path.join(process.cwd(), 'lib', 'fonts', 'Display-Bold.ttf')
        );
      } catch {
        vdpFontDisplay = null;
      }
    }
    if (vdpFontDisplay) return vdpFontDisplay;
  }
  if (role === 'body') {
    try {
      if (bold) {
        if (!vdpFontBodyBold) {
          vdpFontBodyBold = fontkitOpenSync(
            path.join(process.cwd(), 'lib', 'fonts', 'Body-Bold.ttf')
          );
        }
        return vdpFontBodyBold;
      }
      if (!vdpFontBodyRegular) {
        vdpFontBodyRegular = fontkitOpenSync(
          path.join(process.cwd(), 'lib', 'fonts', 'Body-Regular.ttf')
        );
      }
      return vdpFontBodyRegular;
    } catch {
      // fall through to legacy
    }
  }
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
 * Layout satu baris teks: path glyph per posisi pen + advance total + ink-box
 * nyata (dari fontkit glyph bbox, unit font y-up). Ink-box dipakai untuk
 * pemusatan presisi (badge); fallback ke advance bila bbox tak tersedia.
 */
function layoutTextRun(
  text: string,
  fontSizePx: number,
  bold = false,
  trackingPx = 0,
  role: VdpFontRole = 'legacy'
): { parts: string[]; totalWidth: number; inkMinX: number; inkMaxX: number; inkMinY: number; inkMaxY: number; scale: number } {
  const font = getVdpFont(bold, role);
  // Jangan bulatkan scale: r2(0.0155)=0.02 akan mengembangkan glyph ~29%.
  // Pembulatan hanya untuk koordinat translate (penR).
  const scale = fontSizePx / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = run.glyphs as any[];
  const positions = (run as any).positions as Array<{ xAdvance: number }> | undefined;
  // `pen` dalam px output (transform SVG: translate dulu lalu scale,
  // sehingga offset translate harus sudah dalam px, bukan unit font).
  let pen = 0;
  let inkMinX = Infinity;
  let inkMaxX = -Infinity;
  let inkMinY = Infinity;
  let inkMaxY = -Infinity;
  const parts: string[] = [];
  for (let i = 0; i < glyphs.length; i++) {
    const g = glyphs[i];
    const d = g.path ? g.path.toSVG() : '';
    const penR = r2(pen);
    if (d) {
      parts.push(`<g transform="translate(${penR} 0) scale(${scale} ${-scale})"><path d="${d}"/></g>`);
      try {
        const bb = g.path.bbox as { minX: number; minY: number; maxX: number; maxY: number } | undefined;
        if (bb && bb.maxX > bb.minX && bb.maxY > bb.minY) {
          inkMinX = Math.min(inkMinX, penR + bb.minX * scale);
          inkMaxX = Math.max(inkMaxX, penR + bb.maxX * scale);
          inkMinY = Math.min(inkMinY, bb.minY);
          inkMaxY = Math.max(inkMaxY, bb.maxY);
        }
      } catch {
        // abaikan: fallback di bawah
      }
    }
    const advUnits = positions && positions[i] ? positions[i].xAdvance : g.advanceWidth;
    pen += advUnits * scale;
    if (i < glyphs.length - 1) pen += trackingPx;
  }
  const totalWidth = pen;
  if (inkMaxX < inkMinX) {
    inkMinX = 0;
    inkMaxX = totalWidth;
  }
  if (inkMaxY < inkMinY) {
    inkMinY = 0;
    inkMaxY = font.unitsPerEm * 0.73;
  }
  return { parts, totalWidth, inkMinX, inkMaxX, inkMinY, inkMaxY, scale };
}

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
  trackingPx = 0,
  role: VdpFontRole = 'legacy'
): string {
  if (!text) return '';
  const { parts, totalWidth } = layoutTextRun(text, fontSizePx, bold, trackingPx, role);
  const startX = cx - totalWidth / 2;
  return `<g fill="${fill}" transform="translate(${r2(startX)} ${r2(y)})">${parts.join('')}</g>`;
}

/** Lebar px sebuah teks pada ukuran font tertentu (untuk sizing badge). */
function measureTextWidth(
  text: string,
  fontSizePx: number,
  bold = false,
  trackingPx = 0,
  role: VdpFontRole = 'legacy'
): number {
  if (!text) return 0;
  const font = getVdpFont(bold, role);
  const scale = fontSizePx / font.unitsPerEm;
  const run = font.layout(text);
  const glyphs = run.glyphs as any[];
  const positions = (run as any).positions as Array<{ xAdvance: number }> | undefined;
  let pen = 0;
  for (let i = 0; i < glyphs.length; i++) {
    pen += (positions && positions[i] ? positions[i].xAdvance : glyphs[i].advanceWidth) * scale;
    if (i < glyphs.length - 1) pen += trackingPx;
  }
  return pen;
}

const BADGE_GRAD_A = '#B8422E'; // Heritage Red Balikin
const BADGE_GRAD_B = '#E76F2E'; // Modern amber-orange
const BADGE_GRAD_C = '#F59E0B'; // Highlight amber
const BADGE_STROKE = '#8C2F1F';

/**
 * Judul modern: pill gradient brand (merah → oranye → amber) + highlight atas.
 * Teks display condensed putih, tracking 0.06-0.1em untuk caps kecil.
 * `gradId` unik per-cell agar aman saat multi-cell dalam satu SVG.
 */
function renderTitleBadge(
  text: string,
  cx: number,
  bandY0: number,
  bandY1: number,
  fontSizePx: number,
  maxWidthPx: number,
  trackingPx = 1,
  gradId = 'badgeGrad'
): string {
  const padX = Math.round(fontSizePx * 0.6);
  const textWidth = measureTextWidth(text, fontSizePx, true, trackingPx, 'display');
  // Lebar pil mengikuti INK (bukan advance) + padding lega agar tidak ada
  // huruf terpotong di tepi pil.
  const inkPre = layoutTextRun(text, fontSizePx, true, trackingPx, 'display');
  const badgeW = Math.min(inkPre.inkMaxX - inkPre.inkMinX + padX * 2, maxWidthPx);
  const badgeH = bandY1 - bandY0;
  const badgeX = cx - badgeW / 2;
  // Pusatkan INK (bukan advance): startX agar tengah ink-box = cx, baseline
  // agar tengah vertikal ink = tengah pil.
  const ink = inkPre;
  const startX = cx - (ink.inkMinX + ink.inkMaxX) / 2;
  const baseline = (bandY0 + bandY1) / 2 + ((ink.inkMaxY + ink.inkMinY) / 2) * ink.scale;
  const inkText = `<g fill="#FFFFFF" transform="translate(${r2(startX)} ${r2(baseline)})">${ink.parts.join('')}</g>`;
  return (
    `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${BADGE_GRAD_A}"/><stop offset="0.55" stop-color="${BADGE_GRAD_B}"/><stop offset="1" stop-color="${BADGE_GRAD_C}"/>` +
    `</linearGradient></defs>` +
    `<rect x="${r2(badgeX)}" y="${r2(bandY0)}" width="${r2(badgeW)}" height="${r2(badgeH)}" rx="${r2(badgeH / 2)}" fill="url(#${gradId})" stroke="${BADGE_STROKE}" stroke-width="1"/>` +
    `<rect x="${r2(badgeX + 3)}" y="${r2(bandY0 + 2)}" width="${r2(Math.max(0, badgeW - 6))}" height="${r2(Math.max(0, badgeH * 0.42))}" rx="${r2(badgeH * 0.21)}" fill="#FFFFFF" opacity="0.18"/>` +
    inkText
  );
}

/**
 * Caption bawah QR dua baris, two-tone: baris 1 = awal regular abu tua,
 * baris 2 = kata terakhir bold hitam. Blok teks dipusatkan vertikal di gap
 * [gapTopPx, gapBottomPx] (antara QR dan tepi bawah canvas).
 */
function renderBottomCaption(
  text: string,
  cx: number,
  gapTopPx: number,
  gapBottomPx: number,
  fontSizePx: number
): string {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) {
    const y = gapTopPx + Math.max(0, (gapBottomPx - gapTopPx - fontSizePx) / 2) + fontSizePx * 0.85;
    return renderTextPaths(text, cx, y, fontSizePx, '#111111', true, 0, 'body');
  }
  const head = parts.slice(0, -1).join(' ');
  const tail = parts[parts.length - 1];
  const lineH = fontSizePx * 1.3;
  const blockH = lineH * 2;
  const avail = gapBottomPx - gapTopPx;
  const y0 = avail >= blockH + 4
    ? gapTopPx + (avail - blockH) / 2
    : gapTopPx + 2;
  const baseline1 = y0 + fontSizePx * 0.85;
  return (
    renderTextPaths(head, cx, baseline1, fontSizePx, '#7c3aed', true, 0, 'body') +
    renderTextPaths(tail, cx, baseline1 + lineH, fontSizePx, '#7c3aed', true, 0, 'body')
  );
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
    // Tanpa letterbox: jaga aspek asli (fit inside, tanpa bar) agar langkah
    // fill-blur di box memakai gambar murni penuh — bar transparan di cache
    // akan bocor jadi area putih pada background blur.
    return await sharp(buffer).resize(LOGO_CACHE_SIZE * 2, LOGO_CACHE_SIZE * 2, {
      fit: 'inside',
      withoutEnlargement: true,
    }).png().toBuffer();
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
  /** Konten di-center presisi di tengah cell (abaikan margin atas),
      dipakai logo full-bleed yang diperkecil agar ada margin. */
  centerInCell?: boolean;
}

/**
 * Renders one QR/logo cell as a single SVG: background + content are clipped
 * to the wadah's die-cut outline (so nothing bleeds past the cut line), and
 * the same outline is redrawn unclipped as the cutting-mark stroke.
 */
function buildKotakSvg({ shapeKey, contentDataUri, serial, pin, isAktivasi, topLabel, bottomLabel, contentWidthMm, contentHeightMm, centerInCell }: KotakOptions): Buffer {
  const config = getAcrylicShapeConfig(shapeKey);
  const widthPx = mmToPx(config.widthMm);
  const heightPx = mmToPx(config.heightMm);
  const contentWidthPx = mmToPx(contentWidthMm ?? config.qrSizeMm);
  const contentHeightPx = mmToPx(contentHeightMm ?? config.qrSizeMm);
  const topMarginPx = mmToPx(config.qrTopMarginMm);
  const shapeTag = getShapeMarkup(config.maskType, widthPx, heightPx);
  const clipId = `clip${Math.random().toString(36).slice(2, 10)}`;
  const gradId = `bg${Math.random().toString(36).slice(2, 10)}`;
  const badgeGradId = `bdg${Math.random().toString(36).slice(2, 10)}`;

  // Kolom QR akrilik: badge pill merah berisi judul putih besar di atas +
  // caption di bawah QR. Font diskala dari lebar cell agar mudah terbaca di
  // semua bentuk (kecil seperti square/circle maupun tinggi seperti
  // octagon/rectangle). Bentuk lengkung (heart/circle/octagon) menyempit di
  // tepi atas-bawah, jadi judul/caption digeser ke dalam agar tidak menabrak
  // garis potong.
  const hasQrLabels = !isAktivasi && !!topLabel && !!bottomLabel;
  const baseTopFontPx = Math.min(34, Math.max(20, Math.round(widthPx * 0.088)));
  const baseBottomFontPx = Math.min(22, Math.max(13, Math.round(widthPx * 0.062)));
  const topFontPx = config.maskType === 'heart'
    ? Math.min(baseTopFontPx, 24)
    : config.maskType === 'circle'
      ? Math.min(baseTopFontPx, 28)
      : baseTopFontPx;
  const bottomFontPx = config.maskType === 'heart'
    ? Math.min(baseBottomFontPx, 14)
    : baseBottomFontPx;
  const maskExtraTopPx = config.maskType === 'heart' ? 26 : config.maskType === 'circle' ? 12 : config.maskType === 'octagon' ? 14 : 0;
  const maskExtraBottomPx = config.maskType === 'heart' ? 38 : config.maskType === 'circle' ? 10 : config.maskType === 'octagon' ? 10 : 0;
  // Pita badge: mulai di bawah tepi potong, tinggi = font + padding pill.
  // BADGE_TOP_MARGIN memberi space lega di atas SCAN DISINI agar tidak menempel garis potong.
  const badgePadYPx = hasQrLabels ? Math.round(topFontPx * 0.32) : 0;
  const BADGE_TOP_MARGIN_PX = 14;
  let badgeY0Px = hasQrLabels ? maskExtraTopPx + BADGE_TOP_MARGIN_PX : 0;
  let badgeY1Px = hasQrLabels ? badgeY0Px + topFontPx + badgePadYPx * 2 : 0;
  const topReservePx = hasQrLabels ? badgeY1Px + 8 : 0;
  const bottomReservePx = hasQrLabels ? bottomFontPx + 22 + maskExtraBottomPx : 0;
  // Lebar badge maksimum: hormati penyempitan tepi atas bentuk lengkung.
  const badgeMaxWidthPx = widthPx - (10 + maskExtraTopPx) * 2;

  let contentX: number;
  let contentY: number;
  let displayWidthPx: number;
  let displayHeightPx: number;
  if (hasQrLabels) {
    // Sisakan ruang atas & bawah untuk teks, lalu muatkan QR di antaranya.
    // Jika QR config lebih tinggi dari ruang tersedia, kecilkan tampilan
    // (downscale) agar tidak menabrak judul/caption/garis potong.
    // Heart menyempit tajam di bawah tengah: paksa QR ≤82% agar caption
    // tetap di zona lebar, tidak terjepit di ujung bawah.
    const availableH = Math.max(50, heightPx - topReservePx - bottomReservePx);
    const fitScale = Math.min(1, availableH / contentHeightPx);
    const shapeCap = config.maskType === 'heart' ? 0.82 : 1;
    const scale = Math.min(fitScale, shapeCap);
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
      : centerInCell
        ? verticalCenterPx
        : Math.max(topMarginPx, verticalCenterPx);
  }

  // Full-bleed (kolom 2 emboss: konten seukuran canvas): tempel tepat di
  // origin agar tidak terdorong margin atas / terpotong bawah oleh clip.
  const isFullBleed = !hasQrLabels && !isAktivasi && displayWidthPx >= widthPx && displayHeightPx >= heightPx;
  if (isFullBleed) {
    contentX = Math.round((widthPx - displayWidthPx) / 2);
    contentY = Math.round((heightPx - displayHeightPx) / 2);
  }

  // Badge SCAN DISINI presisi di tengah gap [maskExtraTop, QR-top]: QR tidak
  // digeser, hanya pita badge dipindah agar jarak atas-bawahnya simetris.
  if (hasQrLabels) {
    const badgeHpx = topFontPx + badgePadYPx * 2;
    const gapAvail = contentY - maskExtraTopPx - badgeHpx;
    if (gapAvail >= 8) {
      badgeY0Px = maskExtraTopPx + Math.round(gapAvail / 2);
      badgeY1Px = badgeY0Px + badgeHpx;
    }
  }

  const labelText = isAktivasi
    ? renderTextPaths('AKTIVASI', widthPx / 2, Math.max(topMarginPx - 6, 10), 9, '#7c3aed', true)
    : hasQrLabels
      ? renderTitleBadge(topLabel as string, widthPx / 2, badgeY0Px, badgeY1Px, topFontPx, badgeMaxWidthPx, Math.max(1, Math.round(topFontPx * 0.06)), badgeGradId)
      : topLabel
        ? renderTextPaths(topLabel, widthPx / 2, Math.max(topMarginPx - 6, 10), 8, '#1f2937', true)
        : '';

  const pinText = pin
    ? renderTextPaths(`PIN: ${pin}`, widthPx / 2, Math.min(contentY + displayHeightPx + 22, heightPx - 8), 13, '#ef4444', true)
    : hasQrLabels
      ? renderBottomCaption(bottomLabel as string, widthPx / 2, contentY + displayHeightPx + 5, heightPx - maskExtraBottomPx - 10, bottomFontPx)
      : bottomLabel
        ? renderTextPaths(bottomLabel, widthPx / 2, Math.min(contentY + displayHeightPx + 16, heightPx - 8), 7, '#4b5563', false)
        : '';

  const serialBaselineY = config.maskType === 'heart' ? heightPx - 24 : heightPx - 4;
  // Full-bleed menimpa strip bawah dengan gambar: beri pil putih di belakang
  // serial agar nomor produksi tetap terbaca.
  const serialPill = isFullBleed && serial
    ? (() => {
        const w = measureTextWidth(serial, 6.5, false, 0, 'legacy') + 10;
        return `<rect x="${r2(widthPx / 2 - w / 2)}" y="${r2(serialBaselineY - 8.5)}" width="${r2(w)}" height="11" rx="3" fill="#FFFFFF" opacity="0.85"/>`;
      })()
    : '';
  const serialText = renderTextPaths(serial, widthPx / 2, serialBaselineY, 6.5, '#94a3b8', false);
  const washDef = hasQrLabels
    ? `<linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7ED"/><stop offset="0.35" stop-color="#FFFFFF" stop-opacity="1"/><stop offset="1" stop-color="#FEF2F2"/></linearGradient>`
    : '';
  const washRect = hasQrLabels
    ? `<rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="url(#${gradId})"/>`
    : `<rect x="0" y="0" width="${widthPx}" height="${heightPx}" fill="#ffffff"/>`;
  const qrFrame = hasQrLabels
    ? `<rect x="${r2(contentX - 5)}" y="${r2(contentY - 5)}" width="${r2(displayWidthPx + 10)}" height="${r2(displayHeightPx + 10)}" rx="8" fill="none" stroke="#F59E0B" stroke-width="1.5" opacity="0.9"/>`
    : '';

  const svg = `
    <svg width="${widthPx}" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="${clipId}">${shapeTag}/></clipPath>
        ${washDef}
      </defs>
      <g clip-path="url(#${clipId})">
        ${washRect}
        <image href="${contentDataUri}" x="${contentX}" y="${contentY}" width="${displayWidthPx}" height="${displayHeightPx}" preserveAspectRatio="xMidYMid meet"/>
        ${qrFrame}
      </g>
      ${shapeTag} fill="none" stroke="#9ca3af" stroke-width="1.5"/>
      ${labelText}
      ${pinText}
      ${serialPill}
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
  // Jarak aman konten full-bleed dari garis potong (die-cut): logo tetap
  // mengisi cell namun diperkecil merata agar ada margin putih di semua sisi.
  const FULL_BLEED_INSET_MM = 1.5;

export async function generateOneRowSticker(
  tagA: TagVDPData,
  tagB: TagVDPData | null,
  tagC: TagVDPData | null = null,
  shapeKey: AcrylicShapeKey | null = null
): Promise<Buffer> {
  const config = getAcrylicShapeConfig(shapeKey);
  const kotakWidthPx = mmToPx(config.widthMm);
  const kotakHeightPx = mmToPx(config.heightMm);
  const qrSizePx = mmToPx(config.qrSizeMm);

  const PACKET_COLS = 2;
  const numPackets = tagC ? 3 : tagB ? 2 : 1;
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

    // Kolom 2: Logo Balikin atau Foto Kustom. Selalu fit contain agar
    // seluruh logo/foto nampak (tidak terpotong tepi). Sel full-bleed
    // (logo seukuran canvas, mis. emboss 30x45) tetap diperkecil merata
    // (FULL_BLEED_INSET_MM) agar ada margin dari garis potong.
    const isLogoFullBleed =
      (config.logoWidthMm ?? 0) >= config.widthMm &&
      (config.logoHeightMm ?? 0) >= config.heightMm;
    const bleedInsetMm = isLogoFullBleed ? FULL_BLEED_INSET_MM : 0;
    const logoWidthMm = (config.logoWidthMm ?? config.qrSizeMm) - bleedInsetMm * 2;
    const logoHeightMm = (config.logoHeightMm ?? config.qrSizeMm) - bleedInsetMm * 2;
    const logoWidthPx = mmToPx(logoWidthMm);
    const logoHeightPx = mmToPx(logoHeightMm);
    const rawContentBuffer = tag.isCustom && tag.customPhotoUrl
      ? await getCustomPhotoBuffer(tag.customPhotoUrl)
      : isLogoFullBleed
        ? await getRawLogoBuffer()
        : await getLogoBuffer();
    const contentDataUri = bufferToDataUri(
      await fitContainWithFill(rawContentBuffer, logoWidthPx, logoHeightPx)
    );
    const kotak2 = await sharp(buildKotakSvg({
      shapeKey,
      contentDataUri,
      serial: tag.serialNumber || '',
      isAktivasi: false,
      contentWidthMm: logoWidthMm,
      contentHeightMm: logoHeightMm,
      centerInCell: isLogoFullBleed,
    })).png().toBuffer();
    layers.push({ input: kotak2, top: 0, left: offsetLeftPx + kotakWidthPx });
  }

  await buildPacket(tagA, 0);
  if (tagB) {
    await buildPacket(tagB, PACKET_COLS * kotakWidthPx);
  }
  if (tagC) {
    await buildPacket(tagC, 2 * PACKET_COLS * kotakWidthPx);
  }

  return background.composite(layers).png().toBuffer();
}

// ============================================================================
// STREAM GENERATION
// ============================================================================

/**
 * Generate PNG stream for a batch of tags
 * Yields PNG buffers one row at a time (pairsPerRow tags per row, default 2)
 */
export async function* generateVDPStream(
  tags: TagVDPData[],
  shapeKey: AcrylicShapeKey | null = null,
  options: VDPOptions = {}
): AsyncGenerator<Buffer, void, unknown> {
  const n = options.pairsPerRow === 3 ? 3 : 2;
  const toVdp = (t: TagVDPData): TagVDPData => ({
    id: t.id,
    slug: t.slug,
    activationTokenHash: t.activationTokenHash || '',
    activationPinPlain: t.activationPinPlain || '',
    serialNumber: t.serialNumber || '',
    isCustom: t.isCustom || false,
    name: t.name,
    customPhotoUrl: t.customPhotoUrl,
  });
  for (let i = 0; i < tags.length; i += n) {
    const tagA = toVdp(tags[i]);
    const tagB = tags[i + 1] ? toVdp(tags[i + 1]) : null;
    const tagC = n === 3 && tags[i + 2] ? toVdp(tags[i + 2] as TagVDPData) : null;

    const buffer = await renderQueue(() => generateOneRowSticker(tagA, tagB, tagC, shapeKey));
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

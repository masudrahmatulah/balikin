/**
 * VDP A5 Generator - "Protected by Balikin.Online" dark card design.
 * QR box on the left, lock icon + brand copy on the right (centered).
 * Shared by Stiker Balikin Pro (QR box 3.9cm), Daily (2.9cm), and Micro (1.9cm) -
 * only the product config (card height, which drives QR box size) differs between them.
 *
 * Nested PAD_MM margins: QR -> white QR box -> card / cutting line. The text column
 * is always exactly 2x the white QR box width (see computeProtectedCardItemWidth).
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import {
  getStickerProductConfig,
  type StickerProductKey,
  PROTECTED_CARD_PAD_MM,
  PROTECTED_CARD_GAP_MM,
  PROTECTED_CARD_RIGHT_MARGIN_MM,
  FAMILY_ROW_PRODUCTS,
} from './sticker-template';
import { renderText } from './sticker-fonts';
import {
  DEFAULT_STICKER_COLOR_THEME,
  STICKER_COLOR_THEMES,
  type StickerColorTheme,
} from './sticker-color-themes';

type ProtectedCardProductKey = Extract<StickerProductKey, 'stiker-pro' | 'stiker-daily' | 'stiker-micro'>;

const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const DPI = 300;
const MM_TO_PX = DPI / 25.4;

const A5_WIDTH_PX = Math.round(A5_WIDTH_MM * MM_TO_PX);
const A5_HEIGHT_PX = Math.round(A5_HEIGHT_MM * MM_TO_PX);

export interface StickerProTag {
  id: string;
  slug: string;
  serialNumber?: string;
}

/**
 * Render a single "Protected by Balikin.Online" card (background + lock icon + copy, QR composited on top)
 */
async function renderProtectedCard(
  slug: string,
  widthPx: number,
  heightPx: number,
  serialNumber?: string,
  colorTheme: StickerColorTheme = DEFAULT_STICKER_COLOR_THEME,
): Promise<Buffer> {
  const colors = STICKER_COLOR_THEMES[colorTheme];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.id';
  const qrUrl = `${baseUrl}/p/${slug}`;

  // Nested PAD_MM margins: card edge -> white QR box -> QR code itself
  const padPx = Math.round(PROTECTED_CARD_PAD_MM * MM_TO_PX);
  const whiteBoxSize = heightPx - padPx * 2; // white box inset PAD_MM from card/cutting-line edge
  const whiteBoxX = padPx;
  const whiteBoxY = padPx;
  const qrSize = whiteBoxSize - padPx * 2; // QR inset PAD_MM from the white box edge
  const qrX = whiteBoxX + padPx;
  const qrY = whiteBoxY + padPx;
  const boxRadius = Math.round(whiteBoxSize * 0.12);
  const cardRadius = Math.round(heightPx * 0.16);

  // Content column (right side): icon + all text lines are centered as a stacked group.
  // Its width is exactly 2x whiteBoxSize by construction (see computeProtectedCardItemWidth).
  const columnLeft = whiteBoxX + whiteBoxSize + Math.round(PROTECTED_CARD_GAP_MM * MM_TO_PX);
  const rightMarginPx = Math.round(PROTECTED_CARD_RIGHT_MARGIN_MM * MM_TO_PX);
  const columnRight = widthPx - rightMarginPx;
  const centerX = Math.round((columnLeft + columnRight) / 2);
  const availableTextWidth = columnRight - columnLeft;

  // Shrink the title font so the longest line ("BY BALIKIN.ONLINE") always fits the
  // remaining canvas width, instead of a fixed size that can overflow the card edge.
  const longestLineChars = 'BY BALIKIN.ONLINE'.length;
  const boldCharWidthFactor = 0.72; // approx average glyph advance width for bold sans-serif
  const maxTitleFontSize = Math.floor(availableTextWidth / (longestLineChars * boldCharWidthFactor));
  const titleFontSize = Math.min(Math.round(heightPx * 0.2), maxTitleFontSize);
  const taglineFontSize = Math.round(heightPx * 0.08);
  const serialFontSize = Math.round(heightPx * 0.05);

  const lockSize = Math.round(heightPx * 0.14);
  const lockY = Math.round(heightPx * 0.08);
  const iconTextGapPx = Math.round(heightPx * 0.09); // breathing room between icon and "PROTECTED"
  const protectedTopY = lockY + Math.round(lockSize * 1.05) + iconTextGapPx;

  // Background + lock icon only - all text is rendered separately via sharp's native
  // text renderer (see renderText in sticker-fonts.ts) since SVG <text> depends on
  // fontconfig, which is unavailable in the Vercel serverless container.
  const backgroundSvg = Buffer.from(`
    <svg width="${widthPx}" height="${heightPx}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${widthPx}" height="${heightPx}" rx="${cardRadius}" ry="${cardRadius}" fill="${colors.background}"/>
      <rect x="${whiteBoxX}" y="${whiteBoxY}" width="${whiteBoxSize}" height="${whiteBoxSize}" rx="${boxRadius}" ry="${boxRadius}" fill="#ffffff"/>
      <g transform="translate(${centerX - lockSize / 2}, ${lockY})">
        <path d="M ${lockSize * 0.22} ${lockSize * 0.42} v-${lockSize * 0.16} a ${lockSize * 0.28} ${lockSize * 0.28} 0 0 1 ${lockSize * 0.56} 0 v${lockSize * 0.16}"
          fill="none" stroke="#ffffff" stroke-width="${Math.max(2, lockSize * 0.12)}" stroke-linecap="round"/>
        <rect x="0" y="${lockSize * 0.4}" width="${lockSize}" height="${lockSize * 0.62}" rx="${lockSize * 0.14}" fill="#ffffff"/>
      </g>
    </svg>
  `);

  const cardBuffer = await sharp(backgroundSvg).png().toBuffer();

  const qrPngBuffer = await QRCode.toBuffer(qrUrl, {
    width: qrSize,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  });

  const compositeOps: sharp.OverlayOptions[] = [{ input: qrPngBuffer, left: qrX, top: qrY }];
  const centered = (img: { width: number }, topY: number) => ({
    left: Math.round(centerX - img.width / 2),
    top: Math.round(topY),
  });

  const protectedText = await renderText('<span foreground="#ffffff">PROTECTED</span>', {
    bold: true,
    size: titleFontSize,
    letterSpacing: 1,
  });
  compositeOps.push({ input: protectedText.buffer, ...centered(protectedText, protectedTopY) });

  const byLineTopY = protectedTopY + protectedText.height + Math.round(titleFontSize * 0.25);
  const byLineText = await renderText(
    `<span foreground="#ffffff">BY </span><span foreground="${colors.accent}">BALIKIN.ONLINE</span>`,
    { bold: true, size: titleFontSize, letterSpacing: 1 }
  );
  compositeOps.push({ input: byLineText.buffer, ...centered(byLineText, byLineTopY) });

  // Anchor the tagline/serial block to the bottom edge (working upward) instead of fixed
  // height fractions, so it always clears the card regardless of card height (e.g. Micro).
  const bottomMarginPx = Math.round(heightPx * 0.03);
  const lineGapPx = Math.round(taglineFontSize * 0.3);

  const serialText = serialNumber
    ? await renderText(`<span foreground="#6b7280">${serialNumber}</span>`, {
        size: serialFontSize,
      })
    : null;

  const renderTaglineFit = async (markup: string) => {
    const rendered = await renderText(markup, { size: taglineFontSize });
    if (rendered.width <= availableTextWidth) return rendered;
    const fitSize = Math.max(1, Math.floor((taglineFontSize * availableTextWidth) / rendered.width));
    return renderText(markup, { size: fitSize });
  };

  const tagline2Text = await renderTaglineFit(
    '<span foreground="' + colors.textMuted + '">Scan untuk Menghubungi Pemilik Barang</span>'
  );
  const tagline1Text = await renderTaglineFit(
    '<span foreground="' + colors.textMuted + '">If found, please scan to return this item.</span>'
  );

  let cursorFromBottom = heightPx - bottomMarginPx;

  if (serialText) {
    const serialTopY = cursorFromBottom - serialText.height;
    const rightMarginSerialPx = Math.round(2 * MM_TO_PX);
    compositeOps.push({
      input: serialText.buffer,
      left: Math.round(widthPx - rightMarginSerialPx - serialText.width),
      top: Math.round(serialTopY),
    });
    cursorFromBottom = serialTopY - lineGapPx;
  }

  const tagline2TopY = cursorFromBottom - tagline2Text.height;
  compositeOps.push({ input: tagline2Text.buffer, ...centered(tagline2Text, tagline2TopY) });
  cursorFromBottom = tagline2TopY - lineGapPx;

  const tagline1TopY = cursorFromBottom - tagline1Text.height;
  compositeOps.push({ input: tagline1Text.buffer, ...centered(tagline1Text, tagline1TopY) });

  return sharp(cardBuffer).composite(compositeOps).png().toBuffer();
}

/**
 * Generate a single A5 sheet of "Protected by Balikin.Online" cards (Pro or Daily)
 */
export async function generateProtectedCardSheet(
  tags: StickerProTag[],
  productKey: ProtectedCardProductKey,
  colorTheme: StickerColorTheme = DEFAULT_STICKER_COLOR_THEME,
): Promise<Buffer> {
  let canvas = await sharp({
    create: {
      width: A5_WIDTH_PX,
      height: A5_HEIGHT_PX,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).png().toBuffer();

  let image = sharp(canvas);

  const config = getStickerProductConfig(productKey);
  const itemWidthPX = Math.round(config.itemWidth * MM_TO_PX);
  const itemHeightPX = Math.round(config.itemHeight * MM_TO_PX);
  const spacingPX = Math.round(3 * MM_TO_PX);

  const totalGridHeightPX = config.rows * itemHeightPX + (config.rows - 1) * spacingPX;
  const startXPX = Math.round((A5_WIDTH_PX - itemWidthPX) / 2);
  const startYPX = Math.round((A5_HEIGHT_PX - totalGridHeightPX) / 2);

  const compositeOps: sharp.OverlayOptions[] = [];

  for (let i = 0; i < Math.min(tags.length, config.total); i++) {
    const tag = tags[i];
    const posY = startYPX + i * (itemHeightPX + spacingPX);

    const cardBuffer = await renderProtectedCard(tag.slug, itemWidthPX, itemHeightPX, tag.serialNumber, colorTheme);

    compositeOps.push({
      input: cardBuffer,
      left: startXPX,
      top: posY,
    });
  }

  if (compositeOps.length > 0) {
    image = image.composite(compositeOps);
  }

  return image.png().toBuffer();
}

/**
 * Async generator for "Protected by Balikin.Online" A5 sheets (Pro or Daily), for streaming into a ZIP/PDF
 */
export async function* generateProtectedCardStream(
  tags: StickerProTag[],
  productKey: ProtectedCardProductKey,
  colorTheme: StickerColorTheme = DEFAULT_STICKER_COLOR_THEME,
): AsyncGenerator<Buffer, void, unknown> {
  const config = getStickerProductConfig(productKey);
  const itemsPerSheet = config.total;

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    yield await generateProtectedCardSheet(sheetTags, productKey, colorTheme);
  }
}

/**
 * Generate a single A5 "Stiker Balikin Family" sheet: 1 Pro + 2 Daily + as many Micro
 * "Protected By" cards as fit, stacked top to bottom (largest to smallest), each row
 * centered horizontally since the card widths differ per product.
 */
export async function generateFamilyCardSheet(
  tags: StickerProTag[],
  colorTheme: StickerColorTheme = DEFAULT_STICKER_COLOR_THEME,
): Promise<Buffer> {
  let canvas = await sharp({
    create: {
      width: A5_WIDTH_PX,
      height: A5_HEIGHT_PX,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).png().toBuffer();

  let image = sharp(canvas);

  const spacingPX = Math.round(3 * MM_TO_PX);
  const rowHeightsPX = FAMILY_ROW_PRODUCTS.map((key) => Math.round(getStickerProductConfig(key).itemHeight * MM_TO_PX));
  const totalGridHeightPX = rowHeightsPX.reduce((sum, h) => sum + h, 0) + spacingPX * (FAMILY_ROW_PRODUCTS.length - 1);

  let currentY = Math.round((A5_HEIGHT_PX - totalGridHeightPX) / 2);
  const compositeOps: sharp.OverlayOptions[] = [];

  for (let i = 0; i < Math.min(tags.length, FAMILY_ROW_PRODUCTS.length); i++) {
    const config = getStickerProductConfig(FAMILY_ROW_PRODUCTS[i]);
    const itemWidthPX = Math.round(config.itemWidth * MM_TO_PX);
    const itemHeightPX = rowHeightsPX[i];
    const posX = Math.round((A5_WIDTH_PX - itemWidthPX) / 2);

    const cardBuffer = await renderProtectedCard(tags[i].slug, itemWidthPX, itemHeightPX, tags[i].serialNumber, colorTheme);
    compositeOps.push({ input: cardBuffer, left: posX, top: currentY });

    currentY += itemHeightPX + spacingPX;
  }

  if (compositeOps.length > 0) {
    image = image.composite(compositeOps);
  }

  return image.png().toBuffer();
}

/**
 * Async generator for "Stiker Balikin Family" A5 sheets, for streaming into a ZIP/PDF
 */
export async function* generateFamilyCardStream(
  tags: StickerProTag[],
  colorTheme: StickerColorTheme = DEFAULT_STICKER_COLOR_THEME,
): AsyncGenerator<Buffer, void, unknown> {
  const itemsPerSheet = FAMILY_ROW_PRODUCTS.length;

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    yield await generateFamilyCardSheet(sheetTags, colorTheme);
  }
}

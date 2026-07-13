/**
 * VDP A5 Sticker Generator
 * Generates A5 sticker sheets with product-specific layouts
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import { calculateA5StickerPositions, getStickerProductConfig, type StickerProductKey } from './sticker-template';
import { renderText } from './sticker-fonts';

// A5 dimensions at 300 DPI: 1 mm = 11.81 pixels
const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const DPI = 300;
const MM_TO_PX = DPI / 25.4;

const A5_WIDTH_PX = Math.round(A5_WIDTH_MM * MM_TO_PX); // 1748px
const A5_HEIGHT_PX = Math.round(A5_HEIGHT_MM * MM_TO_PX); // 2480px

export interface A5StickerTag {
  id: string;
  slug: string;
  serialNumber?: string;
  activationPinPlain?: string;
  activationTokenHash?: string;
  isCustom: boolean;
  customPhotoUrl?: string;
  name: string;
}

/**
 * Generate a single A5 sticker sheet with QR codes
 */
export async function generateA5StickerSheet(
  tags: A5StickerTag[],
  productKey: StickerProductKey
): Promise<Buffer> {
  // Create base canvas (white background at 300 DPI)
  let canvas = await sharp({
    create: {
      width: A5_WIDTH_PX,
      height: A5_HEIGHT_PX,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  }).png().toBuffer();

  let image = sharp(canvas);

  // Get product config
  const config = getStickerProductConfig(productKey);
  const positions = calculateA5StickerPositions(productKey, 'portrait');

  // QR code size based on sticker size (in pixels at 300 DPI)
  const qrSizeMap = {
    'stiker-pro': 220,      // 35mm sticker
    'stiker-daily': 160,    // 25mm sticker
    'stiker-micro': 120,    // 18mm sticker
    'stiker-family': 220,   // Mixed, use max size
  };

  const qrSize = qrSizeMap[productKey];
  const compositeOps: sharp.OverlayOptions[] = [];

  // Generate QR codes for each tag
  for (let i = 0; i < Math.min(tags.length, positions.length); i++) {
    const tag = tags[i];
    const [posX, posY] = positions[i];

    // Generate QR code
    const qrBuffer = await QRCode.toBuffer(tag.slug, {
      width: 10,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Resize QR to appropriate size
    const resizedQR = await sharp(qrBuffer)
      .resize(qrSize, qrSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
      })
      .png()
      .toBuffer();

    // Add QR to composite operations
    compositeOps.push({
      input: resizedQR,
      left: Math.round(posX * MM_TO_PX),
      top: Math.round(posY * MM_TO_PX),
    });

    // Add serial number text (rendered via sharp's native text renderer with a bundled
    // fontfile - SVG <text> depends on fontconfig, which is unavailable on Vercel)
    if (tag.serialNumber) {
      const serialText = await renderText(`<span foreground="#000000">${tag.serialNumber}</span>`, {
        size: 10,
      });

      compositeOps.push({
        input: serialText.buffer,
        left: Math.round(posX * MM_TO_PX + qrSize / 2 - serialText.width / 2),
        top: Math.round((posY + config.itemHeight + 5) * MM_TO_PX),
      });
    }
  }

  // Apply all composite operations
  if (compositeOps.length > 0) {
    image = image.composite(compositeOps);
  }

  return image.png().toBuffer();
}

/**
 * Generate multiple A5 sticker sheets (one sheet per batch of tags)
 */
export async function generateA5StickerSheets(
  tags: A5StickerTag[],
  productKey: StickerProductKey
): Promise<Buffer[]> {
  const config = getStickerProductConfig(productKey);
  const itemsPerSheet = config.total;
  const sheets: Buffer[] = [];

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    const sheet = await generateA5StickerSheet(sheetTags, productKey);
    sheets.push(sheet);
  }

  return sheets;
}

/**
 * Async generator for A5 sticker sheets (for streaming)
 */
export async function* generateA5StickerStream(
  tags: A5StickerTag[],
  productKey: StickerProductKey
): AsyncGenerator<Buffer, void, unknown> {
  const config = getStickerProductConfig(productKey);
  const itemsPerSheet = config.total;

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    const sheet = await generateA5StickerSheet(sheetTags, productKey);
    yield sheet;
  }
}

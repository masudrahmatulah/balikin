/**
 * VDP A5 Sticker Generator - Two Column Layout
 * Left: QR Code | Right: Custom Photo or Balikin Logo
 */

import sharp from 'sharp';
import QRCode from 'qrcode';
import { getStickerProductConfig, type StickerProductKey } from './sticker-template';
import { renderText } from './sticker-fonts';

// A5 dimensions at 300 DPI: 1 mm = 11.81 pixels
const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const DPI = 300;
const MM_TO_PX = DPI / 25.4;

const A5_WIDTH_PX = Math.round(A5_WIDTH_MM * MM_TO_PX); // 1748px
const A5_HEIGHT_PX = Math.round(A5_HEIGHT_MM * MM_TO_PX); // 2480px

export interface A5TwoColStickerTag {
  id: string;
  slug: string;
  serialNumber?: string;
  activationPinPlain?: string;
  name: string;
  customPhotoUrl?: string | null; // Custom photo URL or base64
}

/**
 * Create default Balikin logo (gradient circle + "B" letter, "B" rendered via sharp's
 * native text renderer since SVG <text> depends on fontconfig, unavailable on Vercel).
 */
async function createDefaultLogo(width: number, height: number): Promise<Buffer> {
  const radius = Math.min(width, height) / 3;
  const fontSize = Math.max(12, Math.min(width, height) / 4);
  const backgroundSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e7ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="#1f2937" opacity="0.85"/>
    </svg>
  `);

  const letterB = await renderText('<span foreground="#ffffff">B</span>', {
    bold: true,
    size: fontSize,
  });

  return sharp(backgroundSvg)
    .composite([
      {
        input: letterB.buffer,
        left: Math.round(width / 2 - letterB.width / 2),
        top: Math.round(height / 2 - letterB.height / 2),
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Generate a single A5 sticker sheet with 2-column layout (QR | Image)
 */
export async function generateA5TwoColStickerSheet(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
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
  const compositeOps: sharp.OverlayOptions[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.id';

  // Calculate position start (centered on page)
  const itemWidthMM = config.itemWidth;
  const itemHeightMM = config.itemHeight;
  const itemWidthPX = Math.round(itemWidthMM * MM_TO_PX);
  const itemHeightPX = Math.round(itemHeightMM * MM_TO_PX);

  // Grid dimensions
  const cols = config.cols;
  const rows = config.rows;
  const spacingPX = Math.round(3 * MM_TO_PX);

  // Calculate starting position to center grid on page
  const totalGridWidthPX = cols * itemWidthPX + (cols - 1) * spacingPX;
  const totalGridHeightPX = rows * itemHeightPX + (rows - 1) * spacingPX;

  const startXPX = (A5_WIDTH_PX - totalGridWidthPX) / 2;
  const startYPX = (A5_HEIGHT_PX - totalGridHeightPX) / 2;

  // Calculate half dimensions for two-column layout
  const halfWidthPX = Math.round((itemWidthPX / 2) - (spacingPX / 4));

  // Get default logo if not provided
  const logoBuffer = defaultLogoBuffer || (await createDefaultLogo(halfWidthPX - 4, itemHeightPX - 4));

  // Generate items for each tag
  for (let i = 0; i < Math.min(tags.length, config.total); i++) {
    const tag = tags[i];
    const row = Math.floor(i / cols);
    const col = i % cols;

    const basePosX = startXPX + col * (itemWidthPX + spacingPX);
    const basePosY = startYPX + row * (itemHeightPX + spacingPX);

    // Generate QR code
    const qrBuffer = await QRCode.toBuffer(`${baseUrl}/p/${tag.slug}`, {
      width: 10,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Resize QR to fit left column
    const resizedQR = await sharp(qrBuffer)
      .resize(halfWidthPX - 4, itemHeightPX - 4, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
      })
      .png()
      .toBuffer();

    // Add QR to left column
    compositeOps.push({
      input: resizedQR,
      left: Math.round(basePosX + 2),
      top: Math.round(basePosY + 2),
    });

    // Process right column (custom photo or default logo)
    let rightImage = logoBuffer;

    if (tag.customPhotoUrl) {
      try {
        if (tag.customPhotoUrl.startsWith('http')) {
          // Fetch from URL (custom photo URL)
          const response = await fetch(tag.customPhotoUrl);
          const buffer = await response.arrayBuffer();
          rightImage = Buffer.from(buffer);
        } else if (tag.customPhotoUrl.startsWith('data:')) {
          // Base64 encoded image
          const base64Data = tag.customPhotoUrl.replace(/^data:image\/\w+;base64,/, '');
          rightImage = Buffer.from(base64Data, 'base64');
        }
      } catch (error) {
        console.error(`Failed to load custom photo for tag ${tag.slug}:`, error);
        rightImage = logoBuffer;
      }
    }

    // Resize and fit custom photo/logo to right column
    const resizedPhoto = await sharp(rightImage)
      .resize(halfWidthPX - 4, itemHeightPX - 4, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toBuffer();

    // Add photo to right column
    compositeOps.push({
      input: resizedPhoto,
      left: Math.round(basePosX + halfWidthPX + 2),
      top: Math.round(basePosY + 2),
    });

    // Optional: Add border around the sticker item
    const borderSvg = Buffer.from(`
      <svg width="${itemWidthPX}" height="${itemHeightPX}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${itemWidthPX - 1}" height="${itemHeightPX - 1}" fill="none" stroke="#d1d5db" stroke-width="1"/>
        <line x1="${halfWidthPX}" y1="0" x2="${halfWidthPX}" y2="${itemHeightPX}" stroke="#d1d5db" stroke-width="1"/>
      </svg>
    `);

    const borderBuffer = await sharp(borderSvg).png().toBuffer();

    compositeOps.push({
      input: borderBuffer,
      left: Math.round(basePosX),
      top: Math.round(basePosY),
    });

    // Optional: Add serial number text if available
    if (tag.serialNumber) {
      const serialSvg = Buffer.from(`
        <svg width="${halfWidthPX}" height="20" xmlns="http://www.w3.org/2000/svg">
          <text x="${halfWidthPX / 2}" y="14" font-family="Arial, monospace" font-size="8" fill="#374151" text-anchor="middle">
            ${tag.serialNumber}
          </text>
        </svg>
      `);

      const serialBuffer = await sharp(serialSvg).png().toBuffer();

      compositeOps.push({
        input: serialBuffer,
        left: Math.round(basePosX),
        top: Math.round(basePosY + itemHeightPX + 2),
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
export async function generateA5TwoColStickerSheets(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
): Promise<Buffer[]> {
  const config = getStickerProductConfig(productKey);
  const itemsPerSheet = config.total;
  const sheets: Buffer[] = [];

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    const sheet = await generateA5TwoColStickerSheet(sheetTags, productKey, defaultLogoBuffer);
    sheets.push(sheet);
  }

  return sheets;
}

/**
 * Async generator for A5 sticker sheets (for streaming)
 */
export async function* generateA5TwoColStickerStream(
  tags: A5TwoColStickerTag[],
  productKey: StickerProductKey,
  defaultLogoBuffer?: Buffer
): AsyncGenerator<Buffer, void, unknown> {
  const config = getStickerProductConfig(productKey);
  const itemsPerSheet = config.total;

  for (let i = 0; i < tags.length; i += itemsPerSheet) {
    const sheetTags = tags.slice(i, i + itemsPerSheet);
    const sheet = await generateA5TwoColStickerSheet(sheetTags, productKey, defaultLogoBuffer);
    yield sheet;
  }
}

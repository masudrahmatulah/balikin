/**
 * VDP Test Function - Generate 1 packet (3 columns)
 * Used for debugging and verification
 */

import sharp from 'sharp';
import QRCode from 'qrcode';

// Constants (300 DPI: 1 mm = 11.81 pixels)
const KOTAK_WIDTH = 354; // 30mm
const KOTAK_HEIGHT = 531; // 45mm
const PACKET_COLS = 3;

async function getLogoBuffer(): Promise<Buffer> {
  const logoSvg = Buffer.from(`
    <svg width="220" height="220" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="220" fill="#0EA5E9"/>
      <text x="110" y="90" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white" text-anchor="middle">BALIKIN</text>
      <text x="110" y="120" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Smart Lost &amp; Found</text>
      <circle cx="110" cy="160" r="20" fill="white"/>
      <circle cx="110" cy="155" r="8" fill="#0EA5E9"/>
    </svg>
  `);
  return await sharp(logoSvg).resize(220, 220).png().toBuffer();
}

function drawTextSvg(pin: string, serial: string, isAktivasi = false): Buffer {
  return Buffer.from(`
    <svg width="${KOTAK_WIDTH}" height="${KOTAK_HEIGHT}">
      <style>
        .serial { font-family: sans-serif; font-size: 6pt; fill: #475569; }
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

/**
 * Generate 1 packet with 3 columns (QR Utama + Logo + QR Aktivasi)
 */
export async function generateSinglePacketTest(
  slug: string,
  activationTokenHash: string,
  activationPinPlain: string,
  serialNumber: string
): Promise<Buffer> {
  const canvasWidth = PACKET_COLS * KOTAK_WIDTH; // 1062px

  console.log('[TEST] Canvas width:', canvasWidth);
  console.log('[TEST] Columns:', PACKET_COLS);
  console.log('[TEST] Token hash:', activationTokenHash ? 'YES' : 'NO');

  // Create background
  const background = sharp({
    create: {
      width: canvasWidth,
      height: KOTAK_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  const layers: sharp.OverlayOptions[] = [];

  // Kolom 1: QR Utama
  const qrUtama = await QRCode.toBuffer(
    `https://balikin.id/p/${slug}`,
    { width: 220, margin: 1 }
  );
  const textSvg = drawTextSvg(activationPinPlain, serialNumber, false);

  layers.push(
    { input: qrUtama, top: 120, left: 67 },
    { input: textSvg, top: 0, left: 0 }
  );
  console.log('[TEST] Added QR Utama at position 0');

  // Kolom 2: Logo
  const logoResized = await sharp(await getLogoBuffer()).resize(220, 220).toBuffer();
  layers.push(
    { input: logoResized, top: 120, left: KOTAK_WIDTH + 67 },
    { input: textSvg, top: 0, left: KOTAK_WIDTH }
  );
  console.log('[TEST] Added Logo at position', KOTAK_WIDTH);

  // Kolom 3: QR Aktivasi
  const qrAktivasi = await QRCode.toBuffer(
    `https://balikin.id/activate?slug=${slug}&token=${activationTokenHash}`,
    { width: 220, margin: 1 }
  );
  const textSvgAktivasi = drawTextSvg(activationPinPlain, serialNumber, true);

  layers.push(
    { input: qrAktivasi, top: 150, left: (KOTAK_WIDTH * 2) + 67 },
    { input: textSvgAktivasi, top: 0, left: KOTAK_WIDTH * 2 }
  );
  console.log('[TEST] Added QR Aktivasi at position', KOTAK_WIDTH * 2);

  console.log('[TEST] Total layers:', layers.length);

  const result = await background.composite(layers).png().toBuffer();
  console.log('[TEST] Generated buffer size:', result.length);

  return result;
}

// Run test if called directly
if (require.main === module) {
  (async () => {
    const testBuffer = await generateSinglePacketTest(
      'test-slug',
      'test-token-hash-12345',
      'A1B2-C3D4',
      'B01-001'
    );

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('/tmp/vdp-test-output.png', testBuffer);
    console.log('[TEST] Saved to /tmp/vdp-test-output.png');
  })();
}

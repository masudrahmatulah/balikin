#!/usr/bin/env node

/**
 * Generate app icons from BALIKIN logo
 * This script extracts the icon portion and creates all required sizes
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// BALIKIN logo URL (from user's image)
const LOGO_URL = 'https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/91b63173-47fe-4150-a689-4114aee75049/bfd7b1e72a5272d8a8a88e70d4cdcd78.png?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1777071453&Signature=yC/g/6j9wELgSUWbR3wyp0rR8Rk=';

// Icon sizes needed
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Additional sizes for favicon
const FAVICON_SIZES = [16, 32, 48];

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

async function downloadImage(url, outputPath) {
  console.log('Downloading logo from URL...');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}

async function generateIcons() {
  console.log('🎨 Starting icon generation for BALIKIN...\n');

  await ensureDir(ICONS_DIR);

  const tempLogoPath = path.join(PUBLIC_DIR, 'balikin-logo-temp.png');

  try {
    // Download the logo
    await downloadImage(LOGO_URL, tempLogoPath);
    console.log('✓ Logo downloaded\n');

    // Get image info
    const metadata = await sharp(tempLogoPath).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}\n`);

    // The BALIKIN logo has the icon on the left side
    // We need to extract just the diamond icon portion
    // Based on the image, the icon is roughly square and on the left
    const iconSize = Math.min(metadata.width, metadata.height) * 0.5; // Icon is about 50% of height
    const extractLeft = 20; // Padding from left
    const extractTop = (metadata.height - iconSize) / 2;

    console.log('Extracting icon portion from logo...');

    // For the BALIKIN logo, we need to crop just the diamond icon
    // The icon is on the left side of the image
    const baseIcon = await sharp(tempLogoPath)
      .extract({
        left: Math.floor(extractLeft),
        top: Math.floor(extractTop),
        width: Math.floor(iconSize),
        height: Math.floor(iconSize)
      })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Save the base 512x512 icon
    await fs.writeFile(path.join(ICONS_DIR, 'icon-512x512.png'), baseIcon);
    console.log('✓ Created icon-512x512.png');

    // Generate all other sizes from the base 512
    for (const size of ICON_SIZES.filter(s => s !== 512)) {
      const resized = await sharp(baseIcon)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      const filename = `icon-${size}x${size}.png`;
      await fs.writeFile(path.join(ICONS_DIR, filename), resized);
      console.log(`✓ Created ${filename}`);
    }

    // Generate favicon sizes
    for (const size of FAVICON_SIZES) {
      const resized = await sharp(baseIcon)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

      const filename = `favicon-${size}x${size}.png`;
      await fs.writeFile(path.join(PUBLIC_DIR, filename), resized);
      console.log(`✓ Created ${filename}`);
    }

    // Create apple-touch-icon
    const appleIcon = await sharp(baseIcon)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), appleIcon);
    console.log('✓ Created apple-touch-icon.png');

    // Create favicon.ico (using 16x16 and 32x32)
    // Note: sharp doesn't create ICO files directly, so we'll use PNG for favicon
    const favicon32 = await sharp(baseIcon)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await fs.writeFile(path.join(PUBLIC_DIR, 'favicon.png'), favicon32);
    console.log('✓ Created favicon.png');

    // Clean up temp file
    await fs.unlink(tempLogoPath);

    console.log('\n✨ All icons generated successfully!\n');
    console.log('Generated files:');
    console.log('  - public/icons/icon-*.png (8 sizes)');
    console.log('  - public/favicon.png');
    console.log('  - public/apple-touch-icon.png');

  } catch (error) {
    console.error('Error generating icons:', error.message);
    // Clean up temp file on error
    try {
      await fs.unlink(tempLogoPath);
    } catch {}
    process.exit(1);
  }
}

generateIcons();

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SOURCE_IMAGE = '/tmp/balikin-logo.jpg';
const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Ukuran icon yang diperlukan
const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 16, name: '../favicon-16x16.png' },
  { size: 32, name: '../favicon-32x32.png' },
  { size: 180, name: '../apple-touch-icon.png' },
];

// Logo ukuran besar untuk branding
const logos = [
  { size: 1024, name: 'logo.png' },
  { size: 512, name: 'logo-medium.png' },
  { size: 256, name: 'logo-small.png' },
];

async function generateIcons() {
  console.log('🎨 Generating icons from logo...');

  // Pastikan source image ada
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('❌ Source image not found:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Pastikan direktori icons ada
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  try {
    // Baca image source
    const image = sharp(SOURCE_IMAGE);

    // Generate untuk setiap ukuran
    for (const { size, name } of sizes) {
      const outputPath = path.join(ICONS_DIR, name);

      await image
        .clone()
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Generate logos untuk branding
    console.log('\n🎨 Generating branding logos...');
    for (const { size, name } of logos) {
      const outputPath = path.join(PUBLIC_DIR, name);

      await image
        .clone()
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log('\n🎉 All icons and logos generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');
const baseIcon = path.join(publicDir, 'logo-balikin-icon-512.png');

const sizes = [72, 144, 152, 384];

async function generateSizes() {
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(iconsDir, filename);

    await sharp(baseIcon)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(outputPath);

    console.log(`Created ${filename}`);
  }

  // Also update apple-touch-icon and favicon
  await sharp(baseIcon)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  await sharp(baseIcon)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('\nAll icons updated successfully!');
}

generateSizes().catch(console.error);

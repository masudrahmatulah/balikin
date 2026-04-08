/**
 * Generate PNG files from SVG logos
 * Run with: node scripts/generate-logo-pngs.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available, if not provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp library not found. Installing...');
  console.log('Run: npm install sharp --save-dev');
  console.log('Then run this script again.');
  process.exit(1);
}

const sizes = [
  { name: 'logo-16', size: 16 },
  { name: 'logo-32', size: 32 },
  { name: 'logo-48', size: 48 },
  { name: 'logo-64', size: 64 },
  { name: 'logo-128', size: 128 },
  { name: 'logo-256', size: 256 },
  { name: 'logo-512', size: 512 },
  { name: 'logo-1024', size: 1024 },
];

const svgFiles = [
  { input: 'public/logo-balikin.svg', output: 'logo-balikin', sizes: [128, 256, 512, 1024] },
  { input: 'public/logo-balikin-icon.svg', output: 'logo-balikin-icon', sizes: [64, 128, 256, 512] },
  { input: 'public/logo-balikin-favicon.svg', output: 'favicon', sizes: [16, 32, 48] },
  { input: 'public/logo-balikin-horizontal.svg', output: 'logo-balikin-horizontal', sizes: [280] },
  { input: 'public/logo-balikin-white.svg', output: 'logo-balikin-white', sizes: [128, 256, 512] },
];

async function convertSvgToPng() {
  const publicDir = path.join(__dirname, '..', 'public');

  for (const file of svgFiles) {
    const inputPath = path.join(__dirname, '..', file.input);

    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${file.input} - not found`);
      continue;
    }

    const svgBuffer = fs.readFileSync(inputPath);

    for (const size of file.sizes) {
      const outputPath = path.join(publicDir, `${file.output}-${size}.png`);

      try {
        await sharp(svgBuffer)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(outputPath);

        console.log(`✓ Generated: ${file.output}-${size}.png`);
      } catch (error) {
        console.error(`✗ Error generating ${file.output}-${size}.png:`, error.message);
      }
    }
  }

  // Generate ICO file for favicon
  const faviconSvg = path.join(__dirname, '..', 'public/logo-balikin-favicon.svg');
  if (fs.existsSync(faviconSvg)) {
    const svgBuffer = fs.readFileSync(faviconSvg);

    try {
      // Generate multiple sizes for ICO
      const sizes = [16, 32, 48];
      const pngBuffers = await Promise.all(
        sizes.map(size =>
          sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toBuffer()
        )
      );

      // Create a simple ICO (we'll use the 32px as main favicon)
      await sharp(pngBuffers[1]).toFile(path.join(publicDir, 'favicon.ico'));
      console.log('✓ Generated: favicon.ico');
    } catch (error) {
      console.error('✗ Error generating favicon.ico:', error.message);
    }
  }

  console.log('\nDone! Logo PNG files generated successfully.');
}

convertSvgToPng().catch(console.error);

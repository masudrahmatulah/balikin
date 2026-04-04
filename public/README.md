# PWA Icons

This folder contains PWA icons for the Balikin application.

## Required Icons

The following icon sizes are needed for PWA functionality:

- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- favicon.ico (16x16, 32x32)
- apple-touch-icon.png (180x180)

## How to Generate Icons

### Option 1: Online Tool (Recommended)

1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo (QR code icon)
3. Select the primary color: #2563eb (blue)
4. Download all generated icons
5. Place them in the `/icons/` folder

### Option 2: Using ImageMagick

If you have ImageMagick installed:

```bash
# Convert SVG to PNG in various sizes
for size in 72 96 128 144 152 192 384 512; do
  convert icon-${size}x${size}.png -resize ${size}x${size} icons/icon-${size}x${size}.png
done
```

### Option 3: Using Figma/Illustrator

1. Create a 512x512px artboard
2. Design your icon with:
   - Primary color: #2563eb (blue)
   - Icon: QR Code symbol
   - Background: White or transparent
3. Export in all required sizes
4. Save to `/icons/` folder

## Icon Design Specifications

- **Primary Color:** #2563eb (Blue)
- **Icon Symbol:** QR Code from Balikin logo
- **Background:** White with subtle gradient
- **Style:** Flat, modern, clean
- **Corner Radius:** 20-25% for modern look

## Temporary Placeholder

For development/testing, you can use placeholder icons from:
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/favicon-generator/

## Verification

After adding icons, verify:
1. All icon files exist in `/icons/` folder
2. Manifest.json references are correct
3. Icons load correctly in browser
4. PWA install prompt appears (Android)

## Current Status

⚠️ Icons need to be generated and added to the `/icons/` folder.
The manifest.json file is already configured with the correct icon references.

# Balikin App Icons & Logo Guide

Icon dan logo baru telah berhasil dibuat dari gambar yang Anda berikan.

## 📱 Icons yang Tersedia

### PWA & Browser Icons (di `public/icons/`)
- `icon-72x72.png` (72x72) - PWA icon kecil
- `icon-96x96.png` (96x96) - PWA icon medium
- `icon-128x128.png` (128x128) - PWA icon
- `icon-144x144.png` (144x144) - PWA icon
- `icon-152x152.png` (152x152) - PWA icon
- `icon-192x192.png` (192x192) - PWA icon & Favicon besar
- `icon-384x384.png` (384x384) - PWA icon
- `icon-512x512.png` (512x512) - PWA icon besar

### Browser & OS Icons (di `public/`)
- `favicon-16x16.png` (16x16) - Favicon kecil
- `favicon-32x32.png` (32x32) - Favicon standard
- `apple-touch-icon.png` (180x180) - iOS home screen icon

## 🎨 Branding Logos (di `public/`)

### Logo Variants
- `logo.png` (1024x1024, 298KB) - High-res untuk headers & branding
- `logo-medium.png` (512x512, 92KB) - Medium-res untuk components
- `logo-small.png` (256x256, 28KB) - Low-res untuk small UI elements

## 💡 Penggunaan di Code

### Untuk Next.js Image Component
```tsx
import Image from 'next/image';

// Header logo
<Image src="/logo.png" alt="Balikin Logo" width={200} height={200} />

// Medium component logo
<Image src="/logo-medium.png" alt="Balikin Logo" width={100} height={100} />

// Small UI element
<Image src="/logo-small.png" alt="Balikin Logo" width={50} height={50} />
```

### Untuk External Links atau Meta Tags
```html
<!-- Favicon -->
<link rel="icon" href="/favicon-32x32.png" />

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- PWA Icons -->
<link rel="icon" href="/icons/icon-192x192.png" />
```

## 🔄 Re-generate Icons

Jika Anda ingin mengubah icon di masa depan:
1. Letakkan gambar baru di `/tmp/balikin-logo.jpg`
2. Jalankan: `npx tsx scripts/generate-icons.ts`

Script akan otomatis membuat semua ukuran icon yang diperlukan.

## 📝 Konfigurasi yang Sudah Di-update

- ✅ `app/layout.tsx` - Metadata icons sudah dikonfigurasi
- ✅ `public/manifest.json` - PWA icons sudah dikonfigurasi
- ✅ Browser PWA manifest - Semua ukuran terdaftar
- ✅ Apple touch icon - iOS home screen support

## 🎯 Next Steps

Icon siap digunakan! Browser akan otomatis menggunakan icon yang sesuai:
- Tab browser → `favicon-32x32.png`
- Mobile homescreen → `apple-touch-icon.png`
- PWA install → `icon-512x512.png`
- Branding di UI → `logo.png`, `logo-medium.png`, atau `logo-small.png` sesuai kebutuhan

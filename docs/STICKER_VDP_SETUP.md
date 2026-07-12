# Sticker VDP Tool Setup Guide

## Overview

Balikin Sticker VDP Tool adalah sistem untuk generate QR sticker dengan desain 2 kolom menggunakan template A5. Kolom kiri berisi QR code, kolom kanan berisi custom photo atau default Balikin logo.

## Produk Sticker

Terdapat 4 produk sticker yang dapat di-generate:

### 1. Stiker Balikin Pro
- **Ukuran**: 35×35 mm
- **Per Sheet**: 6 sticker
- **Layout**: 2 kolom × 3 baris
- **Use Case**: Premium keychain dengan branding besar

### 2. Stiker Balikin Daily
- **Ukuran**: 25×25 mm
- **Per Sheet**: 12 sticker
- **Layout**: 4 kolom × 3 baris
- **Use Case**: Standard daily use keychain

### 3. Stiker Balikin Micro
- **Ukuran**: 18×18 mm
- **Per Sheet**: 20 sticker
- **Layout**: 5 kolom × 4 baris
- **Use Case**: Compact mini sticker

### 4. Stiker Balikin Family
- **Ukuran**: Mixed (3 Besar + 4 Sedang + 5 Kecil)
- **Per Sheet**: 12 sticker
- **Layout**: Mixed sizes across rows
- **Use Case**: Bundle pack dengan variasi ukuran

## Desain Sticker

### Layout 2 Kolom

Setiap sticker terbagi 2 kolom dengan border pemisah:

```
┌─────────────────────────────────┐
│         │                       │
│   QR    │    Photo/Logo         │
│  Code   │                       │
│         │                       │
└─────────────────────────────────┘
Serial # (opsional)
```

- **Kolom Kiri (QR)**: QR code dengan background putih
- **Kolom Kanan (Photo/Logo)**: 
  - Jika ada custom photo: custom image akan di-resize dan di-fit dengan mode cover
  - Jika tidak ada: default Balikin logo (B icon dengan gradient background)

### Paper Size
- **A5**: 148 × 210 mm (optimal untuk sticker products)
- Sudah ter-optimize dengan margin dan spacing yang sesuai

## Cara Menggunakan

### Akses Tool
1. Login sebagai admin
2. Navigasi ke `/admin/vdp-tool`
3. Pilih tab "Generate New Tags"

### Generate Sticker Batch

1. **Konfigurasi Dasar**
   - Batch Name: Nama batch (contoh: "May-2025-Batch-001")
   - Quantity: Jumlah sticker yang ingin di-generate (1-1000)
   - Material: Pilih "Stiker (Vinyl)"
   - Paper Size: Pilih "A5 (14.8 x 21 cm)"

2. **Konfigurasi Produk**
   - Sticker Product: Pilih salah satu dari 4 produk
   - Sistem akan otomatis menampilkan jumlah sticker per sheet

3. **Generate**
   - Klik "Generate & Export ZIP"
   - System akan membuat QR codes dan generate PNG sheets
   - Download ZIP berisi semua PNG sheets

### Output Format

ZIP file akan berisi:
- `BatchName-sheet-001.png` - A5 sheet 1 (300 DPI)
- `BatchName-sheet-002.png` - A5 sheet 2
- dst...

Setiap PNG sudah siap untuk di-print pada kertas A5 dengan printer standard 300 DPI.

## Custom Photo Integration

Untuk order dengan custom photo:

1. Upload photo saat membuat order
2. Photo akan di-store di Vercel Blob (URL public)
3. Saat generate, kolom kanan akan menampilkan custom photo
4. Photo di-resize otomatis dengan `cover` fit (center-cropped)

## Technical Details

### Files Involved

```
components/admin/vdp-tool-form.tsx
  ↓ (sends POST request)
app/admin/api/vdp/generate/route.ts
  ↓ (uses)
lib/vdp-a5-sticker-twocol.ts (Two-column generator)
  ↑ (uses)
lib/sticker-template.ts (Product config & calculations)
```

### Database Integration

Tags disimpan dengan field:
- `stickerProductKey`: Tipe sticker ("stiker-pro", "stiker-daily", dll)
- `customPhotoUrl`: URL atau base64 custom photo (jika ada)
- `isCustom`: Boolean flag untuk custom order
- `serialNumber`: Print tracking number (optional)

### QR Code Generation

- Format: Standard QR code
- Size: Auto-scaled per product (35-220px)
- Content: Tag slug (contoh: `/p/batch-id-001`)
- Error Correction: High (H)

## Print Specifications

### Recommended Settings

- **Printer Type**: Laser atau Inkjet color printer
- **Paper Type**: Sticker vinyl sheet (A5 size)
- **DPI**: 300 DPI (native resolution)
- **Color**: Full color
- **Bleed**: Included in design
- **Cutting**: Manual cut or professional die-cut

### Pre-Print Checklist

1. ✅ A5 vinyl sticker sheets ready
2. ✅ Printer calibrated for color accuracy
3. ✅ Test print 1 sheet first
4. ✅ Verify QR scans correctly
5. ✅ Check photo quality on sticker
6. ✅ Verify serial numbers (if used)

## Troubleshooting

### QR Code Not Scanning
- Ensure contrast is high (black on white background)
- Check if QR code is damaged/blurry during print
- Verify URL in QR is correct format

### Custom Photo Not Showing
- Check if URL is accessible (not expired)
- Verify image format is PNG/JPG
- Check image dimensions (should be square or landscape)

### Sheet Generation Takes Too Long
- Large quantities (>500) may take time
- Check server logs for details
- Consider splitting into smaller batches

## API Reference

### POST `/admin/api/vdp/generate`

**Request Body**
```typescript
{
  batchName: string;
  quantity: number;
  materialType: "sticker";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a5";
  stickerProductKey: "stiker-pro" | "stiker-daily" | "stiker-micro" | "stiker-family";
  adminId: string;
  isCustom?: boolean;
  customPhotoData?: string; // base64 encoded image
}
```

**Response**
```typescript
{
  downloadUrl: string; // data:application/zip;base64,...
  generatedTags: Array<{
    slug: string;
    sequenceNumber: string;
    filename: string;
  }>;
}
```

## Future Enhancements

- [ ] Support for 1-column layout (QR only)
- [ ] Support for 3-column layout (QR + Photo + Text)
- [ ] Batch watermarking (date, batch number)
- [ ] Customizable logo replacement
- [ ] Direct printer integration
- [ ] Preview before download

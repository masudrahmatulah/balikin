# VDP Sticker Tool - Quick Start Guide

## 🎯 Tujuan Cepat Membuat Sticker QR

Panduan ini akan memandu Anda membuat sticker QR menggunakan Balikin VDP Tool.

## 📍 Akses Tool

1. Login ke dashboard admin: `/admin`
2. Cari menu "VDP Tool" atau navigasi ke `/admin/vdp-tool`
3. Anda akan melihat form "Generate New Tags"

## 🖼️ Proses Generate Sticker

### Step 1: Pilih Material & Format

```
1. Material: Pilih "Stiker (Vinyl)"
2. Paper Size: Pilih "A5 (14.8 x 21 cm)"
```

Ketika Anda memilih A5, opsi sticker product akan muncul otomatis.

### Step 2: Pilih Produk Sticker

Ada 4 pilihan produk yang tersedia:

```
┌─────────────────────────────────┐
│ ⭐ Stiker Balikin Pro           │  ← Untuk branding premium
│    125×43 mm, 4 per sheet       │
│                                 │
│ 📌 Stiker Balikin Daily         │  ← Standard daily use
│    95×33 mm, 5 per sheet        │
│                                 │
│ 🔗 Stiker Balikin Micro         │  ← Compact mini sticker
│    65×23 mm, 8 per sheet        │
│                                 │
│ 🎁 Stiker Balikin Family        │  ← Bundle mix
│    1 Pro + 2 Daily + 3 Micro    │
│    6 per sheet                  │
└─────────────────────────────────┘
```

**Pilih berdasarkan use case:**
- **Pro**: Produk premium, keychain berkualitas tinggi
- **Daily**: Penggunaan umum, keseimbangan harga/kualitas
- **Micro**: Sticker kecil, aksesoris tambahan
- **Family**: Paket bundel dengan variasi

### Step 3: Isi Konfigurasi Dasar

```
Batch Name:  May-2025-Batch-001
Quantity:    100
Material:    Stiker (Vinyl)
Paper Size:  A5 (14.8 x 21 cm)
```

### Step 4: Klik "Generate & Export ZIP"

Sistem akan:
1. Membuat QR codes untuk setiap sticker
2. Generate PNG sheets (A5 size, 300 DPI)
3. Package ke dalam ZIP file
4. Siap untuk download

### Step 5: Download dan Print

1. ZIP akan berisi file PNG sheets
   - `May-2025-Batch-001-sheet-001.png`
   - `May-2025-Batch-001-sheet-002.png`
   - dll...

2. Print setiap PNG ke kertas sticker A5
   - Gunakan printer color (laser atau inkjet)
   - DPI 300 (native resolution)
   - Paper: Vinyl sticker sheet A5

3. Cut dan gunakan

## 🎨 Desain Sticker

Setiap sticker memiliki desain 2 kolom:

```
LEFT SIDE              RIGHT SIDE
┌────────────┬─────────────────────┐
│            │                     │
│    QR      │   Photo/Logo        │
│   Code     │                     │
│  (B&W)     │   (Color Optional)  │
│            │                     │
└────────────┴─────────────────────┘
```

**Kolom Kiri:** QR Code (hitam putih)
- Dapat di-scan dengan smartphone
- Points to: `/p/[tag-slug]`

**Kolom Kanan:** Custom Photo atau Default Logo
- Jika custom order: tampilkan custom photo
- Jika standard: tampilkan Balikin logo default

## 💡 Tips & Tricks

### Untuk Custom Photo

Jika Anda ingin custom photo pada sticker (untuk order khusus):

1. Ada opsi di form untuk upload custom photo
2. Photo akan ditampilkan di kolom kanan setiap sticker
3. Photo akan di-resize otomatis dan center-cropped
4. Recommended: Gunakan square photo (1:1 ratio) untuk hasil terbaik

### Batch Naming Convention

Gunakan format yang konsisten:
```
[Month]-[Year]-[Type]-[Sequence]

Examples:
- May-2025-Batch-001
- Jun-2025-Premium-Pro-001
- Jun-2025-Standard-Daily-001
```

### Sheet Estimation

Form akan menampilkan estimasi sheet yang dibutuhkan:
```
Quantity: 100
Product: Daily (5 per sheet)
Sheets: 20 sheets (100 ÷ 5 = 20)
```

## 📋 Print Checklist

Sebelum print:

- [ ] Printer sudah siap (color, 300 DPI)
- [ ] Paper: A5 vinyl sticker sheets ready
- [ ] Tinta/toner cukup
- [ ] Test print 1 sheet dulu

Saat print:
- [ ] Set print size: 100% (no scaling)
- [ ] Page orientation: Portrait (A5)
- [ ] No margins (bleed included)
- [ ] Color mode: RGB

Setelah print:
- [ ] Tunggu tinta kering (2-3 menit untuk inkjet)
- [ ] Cek kualitas QR code (test scan dengan phone)
- [ ] Cek kualitas foto (warna, sharpness)
- [ ] Cut sesuai garis (jika ada)

## 🔧 Troubleshooting

### QR Code Tidak Bisa di-Scan

**Penyebab:**
- QR terlalu kecil atau blur
- Printer quality rendah
- Lighting saat scan buruk

**Solusi:**
- Test scan dengan phone camera
- Coba angle berbeda
- Pastikan pencahayaan cukup

### Foto Custom Tidak Muncul

**Penyebab:**
- URL foto expired
- Format foto tidak supported
- Koneksi internet error saat generate

**Solusi:**
- Gunakan URL yang valid & public
- Format: PNG, JPG (standar)
- Cek koneksi internet
- Foto akan fallback ke default logo jika error

### Print Quality Buruk

**Penyebab:**
- Paper type salah
- Printer setting tidak tepat
- Tinta/toner berkualitas rendah

**Solusi:**
- Gunakan paper yang di-recommend (vinyl sticker)
- Set ke mode best quality
- Gunakan tinta/toner original

## 📞 Support

Jika ada pertanyaan atau issue:
1. Baca dokumentasi: `/docs/STICKER_VDP_SETUP.md`
2. Check implementation: `/docs/STICKER_VDP_IMPLEMENTATION.md`
3. Contact admin team

## 🚀 Next Steps

Setelah berhasil generate sticker:

1. **Production**: Forward PNG files ke production team
2. **Printing**: Print menggunakan professional printer
3. **Inventory**: Track serial numbers jika ada
4. **Fulfillment**: Distribute ke customers

---

**Happy Sticker Making! 🎉**

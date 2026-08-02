# QC Documentation: FASE 6 - Uji Coba Lapangan (Physical QC & Digital)

**Versi**: 1.0
**Tanggal**: 2026-06-13
**Tujuan**: Dokumentasi prosedur Quality Control untuk VDP PDF dan simulasi alur aktivasi

---

## 1. Spesifikasi VDP PDF (PRD v2)

### Dimensi Grid A3 Landscape (297 × 420 mm)

```
TOTAL LEMBAR: A3 Landscape (420 × 297 mm)
┌──────────────────────────────────────────────────────────────┐
│  MARGIN: 10mm (atas, bawah, kiri, kanan)                     │
│  GAP: 2mm (antara paket horizontal & vertikal)                │
├──────────────────────────────────────────────────────────────┤
│  Lebar Cetak Bersih: 400 mm                                   │
│  Tinggi Cetak Bersih: 277 mm                                  │
├──────────────────────────────────────────────────────────────┤
│  KAPASITAS:                                                   │
│  - 4 Kolom Paket (horizontal) × 5 Baris (vertikal)           │
│  - Total: 20 Paket Stiker per lembar                         │
│  - Total Stiker Individual: 60 stiker                        │
└──────────────────────────────────────────────────────────────┘
```

### Dimensi Satu Paket (90 × 45 mm)

```
┌─────────┬─────────┬─────────┐
│ Kolom 1 │ Kolom 2 │ Kolom 3 │
│ 30mm    │ 30mm    │ 30mm    │  Tinggi: 45mm
├─────────┼─────────┼─────────┤
│ QR      │ Logo    │ QR +    │
│ Utama   │ Balikin │ PIN     │
└─────────┴─────────┴─────────┘
```

**Kolom 1 (QR Utama)**: 30 × 45 mm
- QR Code untuk halaman publik penemu
- Resolusi minimal 300 DPI untuk cetak

**Kolom 2 (Logo Balikin)**: 30 × 45 mm
- Logo branding Balikin

**Kolom 3 (Stiker Aktivasi)**: 30 × 45 mm
- QR Aktivasi (22 × 22 mm) di tengah
- Teks "SCAN UNTUK AKTIVASI" di bagian atas
- PIN polos (6 karakter alfanumerik)
- Nomor Seri Mikro (6pt, warna abu-abu gelap) di margin bawah

---

## 2. Checklist QC Digital (Sebelum Cetak)

### 2.1 Verifikasi Data Database

```sql
-- Cek jumlah tag yang akan dicetak
SELECT COUNT(*), batch_id
FROM balikin_tags
WHERE batch_id = '[BATCH_ID]'
  AND app_id = 'balikin_id'
GROUP BY batch_id;

-- Pastikan tidak ada tag tanpa serial number
SELECT COUNT(*)
FROM balikin_tags
WHERE batch_id = '[BATCH_ID]'
  AND serial_number IS NULL
  AND app_id = 'balikin_id';
-- Hasil harus: 0

-- Pastikan semua tag memiliki activation_token_hash dan activation_pin_hash
SELECT COUNT(*)
FROM balikin_tags
WHERE batch_id = '[BATCH_ID]'
  AND (activation_token_hash IS NULL OR activation_pin_hash IS NULL)
  AND app_id = 'balikin_id';
-- Hasil harus: 0
```

### 2.2 Verifikasi PDF Output

**Tool**: Admin VDP Tool di `/admin/vdp`

```bash
# 1. Login sebagai admin
# 2. Masuk ke VDP Tool
# 3. Pilih batch yang akan dicetak
# 4. Klik "Generate PDF"
# 5. Download dan verifikasi:
```

**Checklist PDF**:
- [ ] Ukuran halaman: A3 Landscape (420 × 297 mm)
- [ ] Jumlah baris: 5 baris
- [ ] Jumlah kolom: 4 kolom (8 paket per baris)
- [ ] Total paket: 20 paket
- [ ] Gap antar paket: 2mm (horizontal & vertikal)
- [ ] QR Code terbaca (test scan salah satu)
- [ ] Nomor Seri Mikro terbaca (6pt, visual check)
- [ ] PIN polos terbaca (6 karakter)
- [ ] Teks instruksi terbaca ("SCAN UNTUK AKTIVASI")

---

## 3. Checklist QC Fisik (Setelah Cetak)

### 3.1 Uji Cetak di Kertas Biasa

**Tujuan**: Verifikasi presisi sebelum cetak massal di stiker vinyl

```bash
# 1. Print PDF di kertas A3 biasa
# 2. Gunakan printer standar (inkjet/laser)
# 3. Pastikan scaling: 100% (No "Fit to Page")
```

**Checklist Visual**:
- [ ] Margin 10mm di semua sisi tidak terpotong
- [ ] Paket tercetak utuh (tidak terpotong di tepi)
- [ ] QR Code terbaca (test dengan HP)
- [ ] Nomor Seri Mikro (6pt) TERBACA dengan jelas
  - Gunakan kaca pembesar jika perlu
  - Pastikan font tidak blur
- [ ] Garis potong (cutting line) terlihat jelas
- [ ] Gap 2mm antar paket terlihat jelas

### 3.2 Uji Cetak di Stiker Vinyl (Vendor)

**Tujuan**: Final QC sebelum produksi massal

```bash
# 1. Kirim PDF ke vendor cetak stiker
# 2. Minta sample cetak 1 lembar A3
# 3. Lakukan checklist berikut:
```

**Checklist Stiker**:
- [ ] Vinyl waterproof test (tetes air, tidak luntur)
- [ ] QR Code terbaca melalui stiker vinyl
- [ ] Nomor Seri Mikro TERBACA (6pt pada vinyl)
- [ ] PIN polos terbaca dengan jelas
- [ ] Tahan baret (test gores dengan kuku)
- [ ] Warna cetak konsisten (tidak pudar)
- [ ] Cutting line presisi (tidak miring)
- [ ] Adhesive cukup kuat (test tempel di kunci)

---

## 4. Simulasi Alur Unboxing (Digital Flow Test)

### 4.1 Alur Aktivasi Berhasil (Happy Path)

```
[Unboxing Box]
     │
     ├─ Buka kemasan produk
     ├─ Temukan buku manual dengan segel
     └─ Buka segel amplop manual
          │
          ├─┬─> [Opsi 1: Scan QR Aktivasi]
          │        │
          │        ├─ Buka kamera HP
          │        ├─ Scan QR di Kolom 3
          │        ├─ Redirect: /activate?token=XXX&slug=YYY
          │        └─ Lanjut ke langkah validasi
          │
          └─┬─> [Opsi 2: Ketik PIN Manual]
                   │
                   ├─ Buka browser
                   ├─ Navigate: balikin.online/activate
                   ├─ Input slug + PIN manual
                   └─ Lanjut ke langkah validasi
                        │
                        ▼
                 [Validasi Database]
                        │
                 [Check SHA-256 Hash]
                        │
                        ├─ Token/PIN cocok?
                        │  ├─ Ya → Lanjut
                        │  └─ Tidak → Error: "Kode tidak valid"
                        │
                        ▼
                 [Cek Status Tag]
                        │
                        ├─ Status 'unclaimed'?
                        │  ├─ Ya → Lanjut
                        │  └─ Tidak → Error: "Tag sudah diaktifkan"
                        │
                        ▼
                 [Cek Sesi Browser]
                        │
                 [Ada Cookie Aktivasi?]
                        │
                        ├─ Ya → Auto-claim setelah login
                        └─ Tidak → Simpan cookie sementara
                              │
                              ▼
                       [Redirect ke Login]
                              │
                       [Login Google/OTP]
                              │
                              ▼
                    [Auto-Claim Ownership]
                              │
                       [Update Tag Status]
                              │
                        ▼
                 [Klaim Hak Milik Sukses]
                        │
                 [Redirect ke Dashboard]
                        │
                 [Tampilkan Pesan Sukses]
                        │
                 "Tag B01-042 berhasil diaktifkan!"
```

### 4.2 Test Case Manual Fallback (QR Rusak)

**Scenario**: QR Aktivasi di buku manual rusak/blur tidak bisa di-scan

```bash
# Test Case: Manual PIN Fallback
# =====================================

# 1. Buka halaman aktivasi
URL: https://balikin.online/activate

# 2. Input data:
- Slug: [product_slug dari database]
- PIN: [6 karakter dari PIN polos di Kolom 3]

# 3. Klik "Aktifkan"

# Expected Result:
✓ Hash PIN cocok dengan activation_pin_hash di database
✓ Tag berhasil di-claim
✓ User di-redirect ke dashboard

# Error Cases ( harus ditolak):
✗ PIN salah → "Kode Aktivasi atau PIN tidak cocok"
✗ Slug salah → "Aset tidak ditemukan"
✗ Tag sudah claimed → "Tag sudah diaktifkan"
```

### 4.3 Test Case Cookie Sementara (Auto-Claim)

**Scenario**: Pengguna anonim scan QR, lalu login/register

```bash
# Test Case: Auto-Claim After Login
# =====================================

# 1. Scan QR Aktivasi (tanpa login)
# → Redirect ke /activate?token=XXX&slug=YYY

# 2. System simpan cookie sementara (30 menit)
# → Cookie berisi: { slug, token }

# 3. Pengguna klik "Login" di halaman aktivasi

# 4. Setelah login berhasil, system cek cookie:
# → Ada cookie? Ya
# → Eksekusi auto-claim

# 5. Tag ownership assigned ke user yang baru login

# Expected Result:
✓ Cookie tersimpan di browser (30 menit expiry)
✓ Setelah login, auto-claim ter-eksekusi
✓ User tidak perlu input PIN ulang
✓ Redirect ke dashboard dengan pesan sukses
```

---

## 5. Test Case Anti-Race Condition

### 5.1 Concurrent Activation Test

**Scenario**: Dua user mencoba claim tag yang sama secara simultan

```bash
# Test Case: Concurrent Activation
# =====================================

# 1. Gunakan tool: Apache Bench atau k6
# 2. Kirim 10 request secara simultan ke endpoint aktivasi
#    untuk tag yang sama

k6 run - <<EOF
import http from 'k6/http';

export default function () {
  const url = 'https://balikin.online/api/activate';
  const payload = JSON.stringify({
    slug: 'test-slug-123',
    token: 'test-token-abc'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}
EOF

# Expected Result:
✓ Hanya 1 request yang sukses (first wins)
✓ 9 request lain gagal dengan error: "Tag sudah diaktifkan"
✓ Database tidak dalam状态 inconsistent
✓ ownerId hanya dimiliki oleh 1 user

# Verification Query:
SELECT owner_id, status
FROM balikin_tags
WHERE slug = 'test-slug-123';
-- Harus: 1 owner_id saja, status = 'claimed'
```

---

## 6. Test Case Chat Cleanup (FASE 6)

### 6.1 Sliding Window Cleanup Verification

**Scenario**: Chat rooms yang tidak aktif > 2 hari harus dihapus

```bash
# Test Case: Chat Cleanup Sliding Window
# =====================================

# 1. Buat chat room lama (3 hari lalu)
INSERT INTO balikin_chat_rooms (
  id, app_id, tag_id, is_active, created_at, updated_at
) VALUES (
  'test-room-old',
  'balikin_id',
  '[TEST_TAG_ID]',
  true,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'  -- updatedAt 3 hari lalu
);

# 2. Buat chat room baru (1 hari lalu)
INSERT INTO balikin_chat_rooms (
  id, app_id, tag_id, is_active, created_at, updated_at
) VALUES (
  'test-room-new',
  'balikin_id',
  '[TEST_TAG_ID]',
  true,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'  -- updatedAt 1 hari lalu
);

# 3. Jalankan cleanup (via Vercel Cron atau manual trigger)
curl https://balikin.online/api/cron/chat-cleanup

# Expected Result:
✓ Chat room lama (3 hari) DIHAPUS
✓ Chat room baru (1 hari) TETAP ADA
✓ Messages dalam room lama JUGA DIHAPUS

# Verification Query:
SELECT id, updated_at
FROM balikin_chat_rooms
WHERE id IN ('test-room-old', 'test-room-new');
-- Harus: Hanya 'test-room-new' yang ada
```

### 6.2 Active Chat Protection Test

**Scenario**: Chat yang sedang aktif tidak boleh terhapus

```bash
# Test Case: Active Chat Protection
# =====================================

# 1. Buat chat room dengan updated_at baru (baru saja ada pesan)
INSERT INTO balikin_chat_rooms (
  id, app_id, tag_id, is_active, created_at, updated_at
) VALUES (
  'test-room-active',
  'balikin_id',
  '[TEST_TAG_ID]',
  true,
  NOW() - INTERVAL '5 days',  -- created 5 hari lalu
  NOW() - INTERVAL '10 minutes'  -- tapi updated 10 menit lalu!
);

# 2. Jalankan cleanup
curl https://balikin.online/api/cron/chat-cleanup

# Expected Result:
✓ Chat room TETAP ADA (karena updated_at masih baru)
✓ Meskipun created_at sudah 5 hari yang lalu

# Verification Query:
SELECT id, created_at, updated_at
FROM balikin_chat_rooms
WHERE id = 'test-room-active';
-- Harus: Masih ada, karena updated_at < 2 hari
```

---

## 7. Final Production Checklist

### Sebelum Produksi Massal

- [ ] Database migration completed (all columns added)
- [ ] VDP PDF test print OK (kertas biasa)
- [ ] Vendor sample test OK (vinyl)
- [ ] Activation flow tested (QR scan)
- [ ] Manual PIN fallback tested
- [ ] Auto-claim cookie tested
- [ ] Concurrent activation tested (race condition)
- [ ] Chat cleanup tested (sliding window)
- [ ] Vercel cron configured (chat-cleanup endpoint)
- [ ] Environment variables verified (DATABASE_URL, etc.)
- [ ] Admin dashboard VDP tool functional
- [ ] Serial number generation working (B01-XXX format)

### After Production Rollout

- [ ] Monitor activation logs for errors
- [ ] Check chat cleanup execution (Vercel logs)
- [ ] Verify PDF downloads working
- [ ] Test end-to-end: scan → activate → claim → dashboard
- [ ] Gather user feedback on PIN readability

---

## 8. Troubleshooting Guide

### Issue: QR Code Tidak Terbaca

**Symptom**: HP tidak bisa scan QR di stiker

**Possible Causes**:
1. QR resolution terlalu rendah (< 300 DPI)
2. Contrast QR tidak cukup (terlalu terang/gelap)
3. QR terpotong di tepi stiker
4. Vinyl reflection mengganggu scan

**Solutions**:
- Tingkatkan DPI ke 600 saat generate PDF
- Tambahkan white border di sekeliling QR
- Pastikan QR tidak terlalu dekat dengan cutting line
- Gunakan matte finish vinyl untuk mengurangi reflection

### Issue: Nomor Seri Mikro Tidak Terbaca

**Symptom**: 6pt font tidak terbaca dengan mata biasa

**Possible Causes**:
1. Font size terlalu kecil untuk printer resolution
2. Warna font tidak kontras dengan background
3. Printer tidak support fine detail

**Solutions**:
- Tingkatkan ke 7pt atau 8pt jika perlu
- Gunakan warna hitam pekat (#000000)
- Test print dengan printer berbeda
- Pertimbangkan gunakan magnifying glass sebagai QC tool

### Issue: Chat Cleanup Tidak Jalan

**Symptom**: Chat rooms lama tidak terhapus

**Possible Causes**:
1. Vercel cron tidak ter-deploy
2. Endpoint tidak accessible
3. Database connection issue

**Solutions**:
- Check Vercel deployment logs
- Manual trigger endpoint: curl /api/cron/chat-cleanup
- Verify DATABASE_URL env var
- Check if app_id filter is correct

---

*End of QC Documentation*

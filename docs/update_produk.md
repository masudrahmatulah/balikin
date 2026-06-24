# Rencana Strategi Produk & Blueprint Teknis Aplikasi Balikin

Dokumen ini berisi spesifikasi lengkap 9 produk Balikin, strategi penetapan harga, rekomendasi paket unggulan, serta arsitektur implementasi teknis pada sistem Frontend (Next.js) dan Backend (Supabase/PostgreSQL) yang telah di-stress-test menggunakan solusi mitigasi operasional dan logistik.

---

## 1. Matriks Produk, Harga, & Deskripsi Balikin

Daftar lengkap 9 produk Balikin terbagi menjadi tiga kategori utama untuk menjangkau pasar ritel, grosir, maupun B2B, menggunakan **Balikin Armor Tag** sebagai pricing anchor.

| ID | Nama Produk | Harga | Spesifikasi | Deskripsi & Target Barang | Strategi |
|:--:|:--|--:|:--|:--|:--|
| 01 | Balikin Free Pass | Rp 0 | Digital (Cetak Mandiri) | QR Code digital untuk dicetak sendiri di kertas biasa. Fitur terbatas pada notifikasi email dan estimasi lokasi berdasarkan IP Address penemu. | **The Hook**: Penetrasi pasar cepat dan membangun database pengguna aktif. |
| 02 | Balikin Armor Tag (Prime Tag) | Rp 54.000 | 1 Pcs Gantungan Kunci Akrilik | Gantungan kunci akrilik premium tebal, tahan benturan dan cuaca ekstrem. Sangat pas untuk kunci motor/mobil, tas sekolah, atau koper. | **The Anchor**: Tolok ukur nilai produk fisik premium pertama. |
| 03 | Stiker Balikin Pro | Rp 59.000 | 1 Sheet A5 (Isi 6-8 QR) | Stiker Vinyl Premium ukuran besar (3,5 × 3,5 cm atau 4 × 4 cm). Untuk laptop, helm motor, koper, hardcase kamera, atau kaca spion. | Khusus profesional dengan aset berdimensi luas. |
| 04 | Stiker Balikin Daily | Rp 59.000 | 1 Sheet A5 (Isi 12-15 QR) | Stiker Vinyl Premium ukuran sedang (2,5 × 2,5 cm). Untuk botol minum/tumbler, buku agenda, paspor, tablet/iPad, atau kamera mirrorless. | Khusus mengamankan barang bawaan harian kantor/sekolah. |
| 05 | Stiker Balikin Micro | Rp 59.000 | 1 Sheet A5 (Isi 20-24 QR) | Stiker Vinyl Premium ukuran saku (1,8 × 1,8 cm). Untuk casing TWS, remote keyless, powerbank, charger, flashdisk, atau gantungan ID Card. | Khusus barang-barang mini yang sangat rentan terselip. |
| 06 | Stiker Balikin Family | Rp 59.000 | 1 Sheet A5 (Isi 12 QR Campuran) | Kombinasi multi-ukuran: 3 Pcs Besar (3,5 × 3,5 cm), 4 Pcs Sedang (2,5 × 2,5 cm), 5 Pcs Kecil (1,8 × 1,8 cm). Mengamankan segala jenis barang sekaligus dalam satu paket praktis. | ⭐ **BEST SELLER**: Rekomendasi utama kategori stiker dengan opsi paling lengkap. |
| 07 | Balikin Ultimate Pack (Guardian Combo) | Rp 89.000 | 1 Akrilik + 1 Sheet Stiker Family | Paket kombo perlindungan menyeluruh: 1 gantungan kunci akrilik premium dan 1 lembar stiker campuran. | ⭐ **BEST VALUE**: Hemat Rp 24.000 dibanding beli eceran. |
| 08 | Paket Keluarga (Family Protection Pack) | Rp 299.000 | 4 Set Ultimate Pack | Paket proteksi total untuk satu rumah. Isinya dapat dibagi rata untuk Ayah, Ibu, dan 2 Anak. | **High Margin**: Tingkatkan rata-rata nilai transaksi (Basket Size). Hemat Rp 57.000. |
| 09 | Paket Traveller (B2B Commercial Pack) | Rp 699.000 | 10 Set Ultimate Pack | Paket grosir komersial untuk pelaku bisnis. Target: rental mobil, jasa trip pendakian, logistik, atau program reseller. | **B2B Engine**: Amankan pendapatan volume tinggi. Hemat Rp 191.000. |

---

## 2. Validasi Operasional & Logistik (VDP Tool Engine)

Untuk mencegah kekacauan logistik, kesalahan pengemasan, dan kesulitan pelacakan lembar stiker yang rusak saat proses produksi cetak massal (kiss-cut), VDP (Variable Data Printing) Tool diatur dengan logika berikut:

### Metadata Lembar (Footnote Tracking)
VDP Tool secara otomatis mencetak teks kecil/barcode Sheet_ID (contoh: `BLK-FAM-B01-0042`) pada area waste kertas A5 (bukan di area stiker yang dikelupas).

### Database Mapping
Sebelum diekspor ke PDF, sistem mendaftarkan hubungan relasi antara Sheet_ID dengan rentang array tag_id ke tabel database `sticker_sheets` dengan status produksi `printed`.

### Quality Control (QC) Scan
Saat tim gudang melakukan pengemasan, mereka cukup memindai barcode Sheet_ID menggunakan scanner admin untuk memastikan:
- Satu sheet tersebut utuh
- Tidak tertukar
- Siap dikirim ke konsumen yang tepat

---

## 3. Arsitektur Backend (Supabase / PostgreSQL)

Sistem database dirancang untuk mendukung transisi tag dari status belum diklaim (unclaimed) menjadi terdaftar (claimed) secara aman, mencegah pembajakan token QR di perjalanan, serta membedakan akses fitur berbayar (WhatsApp Gateway) melalui sistem masa aktif.

### A. Skema Database (Tabel Utama)

#### 1. Tabel Tracking Lembaran Stiker Hasil Produksi VDP
```sql
CREATE TABLE sticker_sheets (
    id VARCHAR(100) PRIMARY KEY, -- Sheet_ID dari VDP (misal: 'BLK-FAM-B01-0042')
    package_type VARCHAR(20) CHECK (package_type IN ('pro', 'daily', 'micro', 'family')),
    batch_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. Tabel Produk (Daftar SKU)
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    product_type VARCHAR(20) CHECK (product_type IN ('free', 'acrylic', 'sticker_sheet', 'bundle', 'bulk')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Tabel Serial Tag Utama
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code VARCHAR(10) UNIQUE NOT NULL,       -- Kode pendek unik untuk URL
    sheet_id VARCHAR(100) REFERENCES sticker_sheets(id) ON DELETE SET NULL, -- Kosong untuk Akrilik non-bundle / Free Pass
    sku VARCHAR(50) REFERENCES products(sku),
    tier VARCHAR(10) CHECK (tier IN ('free', 'premium')) DEFAULT 'premium',
    status VARCHAR(15) CHECK (status IN ('unclaimed', 'claimed', 'blocked')) DEFAULT 'unclaimed',
    activation_pin VARCHAR(6) NOT NULL,            -- PIN Gosok Voucher
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Pemilik sah setelah aktivasi
    item_name VARCHAR(100),                        -- Nama barang dari pemilik
    reward_active BOOLEAN DEFAULT FALSE,           -- Khusus premium
    reward_amount DECIMAL(10, 2) DEFAULT 0,
    premium_until TIMESTAMP WITH TIME ZONE NULL,   -- Masa aktif fitur WhatsApp & Chat Anonim (1 tahun gratis)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. Tabel Riwayat Pindaian (Scan History)
```sql
CREATE TABLE scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    estimated_city VARCHAR(100),                   -- Dari IP Geolocation (Fallback)
    latitude DECIMAL(9, 6),                        -- Koordinat GPS akurat (jika diizinkan browser)
    longitude DECIMAL(9, 6),                       -- Koordinat GPS akurat (jika diizinkan browser)
    device_info TEXT
);
```

### B. Kebijakan Masa Aktif Fitur Gateway (Hybrid Freemium)

| Fitur | Durasi | Biaya |
|:--|:--|:--|
| Media Fisik & Fitur Dasar (Notifikasi Email + Lokasi GPS Browser) | Lifetime | Gratis |
| Fitur Integrasi API Pihak Ketiga (Notifikasi WhatsApp + Chat Anonim) | 1 Tahun Pertama | Gratis |
| Langganan Cloud (Setelah 1 tahun) | Recurring | Rp 15.000/tahun |

---

## 4. Arsitektur Frontend (Next.js / React)

Sisi frontend dibagi menjadi tiga jalur antarmuka pengguna:
1. **Toko/Landing Page** - Penjualan produk
2. **Portal Pemindaian Publik (Public Scanner)** - Halaman `/q/[short_code]`
3. **Dashboard Pemilik (User Dashboard)** - Kelola tag dan notifikasi

### A. Alur Halaman Pemindaian Publik (`/q/[short_code]`)

Halaman dinamis yang terbuka saat seseorang memindai QR Code yang menempel di barang.

```
                    [User Scan QR Code]
                              │
                              ▼
                   Halaman: /q/[short_code]
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
        [Status: Unclaimed]      [Status: Claimed]
                  │                       │
                  ▼                       ▼
        Tampilkan Halaman:    Tampilkan Halaman:
      "Aktivasi Tag Baru"    "Hubungi Pemilik"
                  │                       │
                  ▼                       ▼
        Redirect ke:           Tentukan Tampilan:
        /claim-tag?code=...    - Akun Free vs Premium
        (Wajib Login & PIN)    - IP Address & GPS
                               - Tombol Hubungi Pemilik
```

### B. Form Registrasi & Aktivasi Aman (Anti-Hijack Workflow)

Ketika pengguna membeli paket premium fisik, menempelkan stiker, dan memindainya untuk pertama kali:

1. **Formulir Aktivasi Dinamis**
   - Deteksi jenis stiker/akrilik dari database
   - Permintaan autentikasi (Magic Link / Google Sign-In)

2. **Validasi PIN Gosok**
   - Pengguna memasukkan 6 Digit PIN Aktivasi dari kartu fisik
   - Tag tidak berpindah status menjadi `claimed` jika PIN salah
   - Memblokir upaya klaim dari pihak ketiga di perjalanan pengiriman

3. **Labeling & Masa Aktif**
   - Pengguna memberi nama barang (misal: "Tumbler Stanley Hijau")
   - Sistem otomatis menghitung `premium_until` (1 tahun gratis untuk WhatsApp Gateway)

### C. Alur Scan Penemu Barang (Bypass Blokir GPS Browser)

Jika barang berstatus `claimed` dipindai oleh penemu, sistem Next.js memicu alur penangkapan lokasi berbasis empati:

1. **Halaman Antara (Interstitial Page)**
   - Tampilkan pesan persuasif sebelum pop-up izin browser
   - Contoh: "Terima kasih telah menemukan [Nama Barang]! Pemilik sangat mengharapkan barang ini kembali. Bantu dengan membagikan lokasi."

2. **Tombol Pemicu Lokasi**
   - Tombol besar: "Bagikan Lokasi Aman & Hubungi Pemilik"

3. **Geolocalized Execution**
   ```javascript
   navigator.geolocation.getCurrentPosition(
     (position) => {
       // Kirim koordinat akurat ke backend untuk divisualisasikan di Dashboard Pemilik
       sendLocationToBackend(position.coords.latitude, position.coords.longitude);
     },
     (error) => {
       // Fallback: Jika ditolak, jalankan deteksi IP Address
       triggerIPAddressLookup();
     },
     { enableHighAccuracy: true }
   );
   ```

4. **Komunikasi Anonim**
   - Tombol "Chat Anonim Aman" untuk jalur komunikasi terenkripsi real-time
   - Via WhatsApp Bot atau Web Chat tanpa membocorkan nomor ponsel pemilik

---

## 5. Keunggulan Operasional & Skalabilitas Finansial

### Zero Manual Design
Seluruh lembaran stiker multi-ukuran (A5) diatur koordinat grid-nya secara otomatis menggunakan VDP Tool berbasis backend, mengeliminasi proses tata letak manual oleh tim desainer.

### Healthy Cashflow
Batasan masa aktif gratis 1 tahun pertama untuk WhatsApp Gateway mencegah biaya server membengkak (no bleeding margin) saat database pengguna aktif mencapai puluhan ribu di masa depan.

### Seamless Shipping
Pengemasan aman berukuran setengah A4 (A5) yang kaku menjaga QR Code tetap rata, mulus, dan sangat mudah dibaca oleh sensor kamera HP termurah sekalipun tanpa risiko rusak di perjalanan.

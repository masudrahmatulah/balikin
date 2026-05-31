# RANGKUMAN FITUR UTAMA: ADMIN DASHBOARD (OVERVIEW & ANALYTICS)

Dokumen ini memuat daftar fitur wajib untuk halaman Admin Dashboard BALIKIN, yang dirancang untuk mengoptimalkan efisiensi operasional harian (produksi/logistik) dan memantau kesehatan bisnis serta performa produk (termasuk tipe produk Bundling Kits).

---

## I. OPERATIONAL OVERVIEW (Pusat Kendali Harian)

Fokus utama halaman ini adalah meminimalkan hambatan kerja harian (bottleneck) dan memastikan kelancaran rantai pasok fisik serta integrasi sistem digital.

### 1. Manufacturing Queue Metrics

**Fungsi:** Menampilkan antrean cetak berdasarkan tipe material produk yang dipesan pengguna.

**Indikator:** Jumlah pesanan dengan status "Ready to Print", dikelompokkan berdasarkan:
- Stiker Vinyl
- Akrilik Premium
- Bundling Kits (Student Kits, Corporate Packs, Pet Kits)

**Tujuan:** Memudahkan tim produksi mengetahui volume cetak harian tanpa perlu menghitung manual.

---

### 2. One-Click Batch Download VDP (Variable Data Printing)

**Fungsi:** Tombol satu klik untuk mengunduh ribuan berkas QR Code unik yang siap masuk mesin cetak.

**Output:** Format PDF lembaran besar (A3) dengan tata letak matriks presisi (termasuk cutting marks), atau format ZIP berisi file gambar QR vektor resolusi tinggi.

**Tujuan:** Efisiensi waktu divisi produksi dan menghilangkan risiko kesalahan cetak nomor token QR ganda.

---

### 3. System Health & API Monitor

**Fungsi:** Memantau status koneksi dan kesehatan infrastruktur pengiriman pesan instan.

**Indikator:**
- Sisa kuota API WhatsApp Gateway (Zenziva/Fonnte/Wwebjs)
- Success rate pengiriman pesan darurat kepada pemilik barang saat tag di-scan oleh penemu

**Tujuan:** Deteksi dini gangguan server agar pesan penemuan barang tidak tertunda dikirim ke pemilik.

---

### 4. Verification & Claim Queue

**Fungsi:** Daftar permohonan verifikasi identitas dari pengguna secara manual.

**Aksi Admin:** Tombol setuju/tolak untuk menyematkan status Verified Gold Badge pada profil pengguna/organisasi.

**Tujuan:** Mempermudah tugas staf Customer Success (CS) dalam memvalidasi akun orisinal.

---

## II. STRATEGIC ANALYTICS (Pusat Wawasan Bisnis)

Fokus utama halaman ini adalah menyajikan visualisasi data berkadar tinggi untuk membantu manajemen mengambil keputusan strategis demi pertumbuhan perusahaan (growth hack).

### 1. Conversion Funnel Chart

**Fungsi:** Melacak performa konversi corong bisnis secara real-time.

**Alur Visual:**

```
Free Users (Digital DIY) → Membeli Stiker Vinyl → Upgrade ke Akrilik Premium / Bundling
```

**Tujuan:** Mengukur efektivitas kampanye promosi dan peluncuran produk baru.

---

### 2. Lost & Found Success Rate

**Fungsi:** Mengukur rasio kecepatan penemuan kembali barang yang hilang.

**Metrik Utama:**
- Rasio keberhasilan penemuan (Jumlah barang LOST yang kembali ke status SAFE)
- Durasi rata-rata (kecepatan waktu) dari status barang dilaporkan hilang hingga pertama kali di-scan oleh penemu

**Tujuan:** Nilai jual utama (core value) BALIKIN yang digunakan sebagai materi pemasaran berbasis bukti nyata (proof-of-concept).

---

### 3. Geospatial Scan Heatmap

**Fungsi:** Peta panas interaktif yang menunjukkan konsentrasi area tempat pemindaian QR Code terjadi di seluruh Indonesia.

**Tujuan:** Membantu tim Growth & Marketing mengarahkan promosi iklan berbayar secara spesifik (hyperlocal marketing) di wilayah dengan tingkat aktivitas scan tertinggi.

---

### 4. Batch Activation Metrics (Khusus Bundling Kits)

**Fungsi:** Melacak persentase klaim dan aktivasi tag fisik dari pemesanan massal institusi.

**Metrik Utama:** Persentase aktivasi per institusi (Contoh: "Berapa % Student Kits dari Sekolah X yang sudah diklaim oleh siswanya?")

**Tujuan:** Membantu tim CS mengidentifikasi apakah institusi mitra membutuhkan edukasi tambahan jika tingkat aktivasinya rendah setelah barang dikirim.

---

## III. STANDAR DESAIN DAN KEAMANAN ADMIN UI

### 1. Semantic Coloring

Menggunakan warna merah secara hemat — hanya untuk galat sistem fatal atau laporan barang hilang mendesak. Kuning untuk proses berjalan (antrean cetak/validasi), dan hijau untuk aman/selesai.

---

### 2. Role-Based Access Control (RBAC)

Membagi visual menu berdasarkan peran staf admin:

**Staff Produksi & Supply Chain:**
- Hanya mengakses antrean cetak, utilitas bahan, dan ekspor VDP PDF

**Staff Customer Success (CS):**
- Hanya mengakses antrean validasi badge, status klaim, dan bantuan tiket

---

### 3. Masking Nomor WhatsApp Pemilik

Demi menjaga privasi pengguna, nomor kontak pemilik barang tidak boleh ditampilkan dalam teks mentah pada layar admin untuk menghindari bahaya pencurian data (scraping). Gunakan tombol interaktif dengan enkapsulasi.
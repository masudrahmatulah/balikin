# Blueprint Pengembangan Aplikasi "Balikin" (Smart Lost & Found QR Tag)

## 1. Ringkasan Aplikasi (Executive Summary)

**Balikin** adalah platform *Smart Lost & Found* yang menggabungkan produk fisik (gantungan kunci) dengan ekosistem digital. Aplikasi ini memungkinkan pemilik barang mengelola informasi kontak mereka secara dinamis melalui QR Code tanpa harus mengganti unit fisik jika terjadi perubahan data.

### Filosofi Strategi Hybrid: Freemium Digital & Premium Physical
Menghilangkan hambatan masuk (barrier to entry) dengan memberikan akses sistem digital secara gratis, namun mengonversi pengguna menjadi pembeli melalui nilai tambah pada kualitas material, keamanan ekstra, dan prestise.

* **Tujuan:** Memberikan rasa aman bagi pemilik kunci/barang berharga dan memudahkan penemu barang untuk menghubungi pemilik secara instan dan aman.
* **User Types:**
  * **Owner (Pemilik):** Pembeli gantungan kunci yang mengelola profil dan status barang.
  * **Finder (Penemu):** Orang yang melakukan scan QR saat menemukan barang.

---

## 2. Perbandingan Fitur (Tiering)

| Fitur | User Gratis (DIY - Digital Only) | User Premium (Physical Product) |
|-------|----------------------------------|---------------------------------|
| **Akses Dashboard** | Ya, terbatas pada 5 tag | Ya, tidak terbatas/sesuai pesanan |
| **Output QR Code** | Download file digital (PNG/PDF) | Produk fisik (Akrilik/Vinyl Premium) |
| **Halaman Profil** | Standar (Tanpa tanda verifikasi) | Verified Owner Badge (Emas/Biru) |
| **Kustomisasi** | Template desain standar | Bebas upload foto & desain kustom |
| **Notifikasi Scan** | Notifikasi via Dashboard/Email | Real-time WhatsApp Alert (Fonnte API) |
| **Tracking** | Estimasi lokasi berbasis IP | Estimasi lokasi + Izin GPS Presisi |
| **Daya Tahan** | Rendah (Tergantung cara cetak user) | Tinggi (Anti air, Anti pudar, UV Protected) |
| **Scan History** | 7 hari | 30 hari (untuk stiker) |
| **Module Access** | Terbatas | Full access (Student Kit, Otomotif, dll) |

---

## 3. Alur Aplikasi & Alur User

### Alur Aplikasi (Operational)

1. **Pemesanan:** User memesan melalui landing page.
2. **Generasi Tag:** Sistem membuat ID unik (nanoid 12 karakter) dan URL dinamis di database.
3. **Produksi:** Admin/Vendor mencetak QR Code pada gantungan kunci.
4. **Aktivasi:** User menerima barang, scan QR, dan melakukan klaim (registrasi) barang ke akun mereka.
5. **Module Assignment:** Admin dapat menambahkan modul khusus (Student Kit, Otomotif, dll) ke tag tertentu.

### Alur User (Digital Journey)

1. **Login:** User masuk menggunakan Google OAuth atau Email/WhatsApp OTP (Better Auth).
2. **Management:** User mengisi data kontak (WhatsApp, Pesan Khusus).
3. **Mode Toggle:** User mengubah status barang antara **Normal** atau **Hilang** melalui dashboard.
4. **Scanning:** Saat di-scan oleh penemu, sistem mengecek status di database dan menampilkan halaman profil yang sesuai.
5. **Module Access:** User dengan modul aktif dapat mengakses fitur tambahan (jadwal, STNK tracking, dll).

---

## 4. Alur Konversi (Free to Premium Funnel)

1. **Acquisition:** User membuat akun gratis untuk mencoba sistem (misal: untuk wallpaper HP).
2. **Experience:** User merasakan kemudahan Dashboard dan simulasi scan.
3. **The Gap:** User menyadari label cetak sendiri mudah rusak dan tidak terlihat profesional.
4. **Upsell:** Di Dashboard user gratis, muncul banner *"Ubah Tag Digital ini menjadi Gantungan Kunci Akrilik Premium (Cuma Rp35rb)"*.
5. **Conversion:** User melakukan checkout karena data sudah terisi (tidak perlu input ulang).

---

## 5. Core Features (Fitur Utama)

* **Dynamic Redirection:** Mengarahkan satu QR Code ke berbagai aksi berdasarkan status di database.
* **Lost Mode Toggle:** Perubahan tampilan halaman profil secara *real-time* saat barang dinyatakan hilang.
* **WhatsApp Integration:** Tombol "Hubungi Pemilik" yang otomatis membuka chat WA dengan pesan *pre-filled*.
* **Privacy Masking:** Penemu tidak langsung melihat nomor HP di URL, melainkan melalui perantara tombol API WhatsApp.
* **Dashboard User:** Ruang bagi pemilik untuk mengelola banyak tag (jika punya lebih dari satu kunci).
* **Slug Generator:** Menggunakan nanoid 12 karakter untuk keamanan dan ketidakprediktabilan.
* **Verified Owner Badge:** Badge verifikasi untuk pemilik produk premium.
* **Hero Finder Badge:** Badge "Pahlawan Penemu" untuk penemu barang yang menghubungi pemilik.

---

## 6. Module System (Fitur Tambahan per Kategori)

### Student Kit Module 🎓
* **Class Schedule:** Jadwal kuliah dengan hari, jam, dan ruangan.
* **Assignment Deadlines:** Tracking tugas dengan deadline dan notifikasi.
* **Drive Links:** Link ke Google Drive/Dropbox untuk materi kuliah.
* **KTM/KRS Photos:** Upload foto kartu mahasiswa.
* **Schedule Sharing:** Bagikan jadwal via QR code atau share code.
* **Internship vCard:** Profil magang dengan info kontak dan link profesional.
* **Import Schedule:** Import jadwal dari share code teman.

### Otomotif Module 🚗
* **STNK Tracking:** Informasi STNK dan pajak kendaraan.
* **Service History:** Riwayat servis berkala.
* **Oil Change Schedule:** Pengingat ganti oli.
* **Insurance Management:** Info asuransi kendaraan.

### Pertanian Module 🌾
* **HST Calculator:** Kalkulator Hari Setelah Tanam.
* **Fertilizer Schedule:** Jadwal pemupukan berdasarkan HST.
* **Harvest Log:** Catatan panen.
* **Labor Cost Notes:** Catatan biaya tenaga kerja.

### Diklat Module 👥
* **Training Schedule:** Jadwal pelatihan.
* **Participant List:** Daftar peserta.
* **Certificate Info:** Informasi sertifikat.

### Emergency Information Module 🏥
* **Medical Data:** Golongan darah, alergi, kondisi medis.
* **Emergency Contact:** Kontak darurat tambahan.

---

## 7. Admin Features (Fitur Admin)

### Admin Dashboard
* **Overview Statistics:** Total users, tags, lost items, scan logs.
* **Clients Table:** Daftar semua user dengan jumlah tag.
* **Quick Actions:** Akses cepat ke fitur admin.
* **Pending Orders:** Track pesanan sticker/bundle yang pending.

### Client Management
* **Create Client:** Buat user baru secara manual.
* **Update Client:** Edit informasi user.
* **Delete Client:** Hapus user dengan cascade delete tags.
* **Role Management:** Set user sebagai admin atau user biasa.

### Bundle Management
* **Create Bundles:** Generate QR codes untuk paket bundle (Student Kit, Otomotif, Pertanian, Diklat).
* **Bundle Types:** Student Kit (Rp79.000), Otomotif (Rp59.000), Pertanian (Rp69.000), Diklat (Rp149.000).
* **Batch Numbering:** Sistem penomoran batch (001, 002, dst).
* **Bulk QR Generation:** Generate hingga 100 QR dalam satu batch.
* **ZIP Download:** Download semua QR dalam satu file ZIP.

### QR Stock Manager
* **Stock Management:** Kelola stok QR yang tersedia.
* **Bulk Generation:** Generate QR secara massal.
* **Prefix Naming:** Sistem penamaan dengan prefix kustom.

### Sticker Orders Management
* **Order Verification:** Verifikasi bukti pembayaran.
* **Status Updates:** Update status (in_production, shipped, completed).
* **Sticker Types:** Circle/Rectangle, Small/Medium/Large.
* **Bundle Generation:** Generate bundle QR untuk pesanan sticker.

### Layout Editor (Coming Soon)
* **Custom Design:** Editor untuk desain sticker kustom.

---

## 8. Public Pages

### Landing Page
* **Hero Section:** CTA utama dengan penawaran produk.
* **Product Showcase:** Pilihan produk (Best Seller, Populer, Gratis).
* **About Section:** Informasi tentang Balikin.
* **Pricing Table:** Perbandingan harga dan fitur.
* **FAQ Accordion:** Pertanyaan yang sering diajukan.
* **Mobile-First UI:** Tampilan responsif untuk mobile.

### Public Profile Page (`/p/[slug]`)
* **Tag Display:** Tampilan profil tag publik.
* **Lost Mode:** Tampilan khusus untuk barang hilang.
* **WhatsApp Button:** Kontak pemilik via WhatsApp.
* **Scan History:** Riwayat scan (jika aktif).
* **Module Content:** Tampilan konten modul (jadwal, STNK, dll).
* **Emergency Info:** Informasi darurat (jika ada).
* **Hero Finder Badge:** Badge untuk penemu yang menghubungi pemilik.

---

## 9. API Routes

### Authentication API
* **Google OAuth:** Sign in dengan Google.
* **Email/WhatsApp OTP:** Verifikasi via email atau WhatsApp.
* **Session Management:** Manajemen sesi user.

### Admin API
* **Tag Creation:** Buat tag untuk user.
* **Module Management:** Kelola modul user.
* **QR Stock:** Kelola stok QR.
* **Tag Management:** CRUD tag.

### Mobile API
* **User Profile:** Ambil data profil user.
* **User Statistics:** Statistik penggunaan.
* **Recent Activity:** Aktivitas terbaru.
* **User Tags:** Daftar tag user.

### Student Kit API
* **Schedule Sharing:** Share jadwal via QR/code.
* **Schedule Import:** Import jadwal dari share code.
* **vCard Sharing:** Share vCard magang.
* **QR Generation:** Generate QR untuk jadwal/vCard.

### Cron Jobs
* **Deadline Reminders:** Pengingat deadline tugas (terjadwal).

---

## 10. Strategi "Verified Owner Badge"

Badge ini ditampilkan pada halaman publik yang di-scan oleh penemu (Finder):

* **Tujuan Trust:** Menyakinkan penemu bahwa pemilik adalah orang asli yang terverifikasi.
* **Tujuan Gengsi:** Memberikan kepuasan visual bagi pembeli produk fisik.
* **Tujuan Marketing:** Penemu barang yang melihat badge keren ini akan tertarik untuk memiliki sistem serupa (Finder-to-Buyer Loop).

---

## 11. Monetisasi (Revenue Streams)

1. **Direct Sales:** Penjualan satuan gantungan kunci (Standard: Rp29.000, Premium: Rp35.000).
2. **Sticker Packs:** Stiker vinyl waterproof (Small: Rp25.000, Medium: Rp35.000, Large: Rp50.000).
3. **Bundle Packages:** Paket tematik (Student Kit: Rp79.000, Otomotif: Rp59.000, Pertanian: Rp69.000, Diklat: Rp149.000).
4. **Corporate/B2B:** Paket custom untuk sekolah, komunitas motor, tour & travel.
5. **Premium Features (SaaS):** Biaya langganan kecil untuk fitur premium tracking history.

---

## 12. Tech Stack

### Frontend
* **Framework:** Next.js 16.2.3 (App Router)
* **UI Library:** React 19.2.5
* **Language:** TypeScript 5.9.3
* **Styling:** Tailwind CSS 3.4.19
* **UI Components:** shadcn/ui (@radix-ui components)
  - @radix-ui/react-alert-dialog
  - @radix-ui/react-collapsible
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-label
  - @radix-ui/react-slot
  - @radix-ui/react-switch
* **Animation:** Framer Motion 12.35.1
* **Icons:** Lucide React 1.11.0
* **Base UI:** @base-ui/react 1.4.1
* **CSS Utilities:** clsx, tailwind-merge, class-variance-authority (CVA)
* **Animations:** tw-animate-css 1.4.0

### Backend & Database
* **Database:** PostgreSQL via Supabase
* **ORM:** Drizzle ORM 0.45.2
* **Database Toolkit:** Drizzle Kit 0.31.10
* **Database Adapter:** @better-auth/drizzle-adapter 1.6.4

### Authentication
* **Auth Library:** Better Auth 1.6.4
* **Plugins:**
  - Email OTP (better-auth/plugins)
  - Google OAuth support
  - WhatsApp OTP (custom integration)

### QR Code & Generation
* **QR Libraries:**
  - qrcode 1.5.4
  - qrcode.react 4.2.0
* **Slug Generator:** nanoid 5.1.9 (12 karakter untuk keamanan)
* **UUID Generator:** uuid 11.1.0
* **PDF Generation:** jsPDF 4.2.0
* **ZIP Generation:** JSZip 3.10.1 (bulk download)
* **External QR API:** qrserver.com (fallback)

### File Storage
* **Storage:** @vercel/blob 2.3.3
* **Image Processing:** Sharp 0.34.5

### Notifications & Messaging
* **WhatsApp:** Fonnte API
  - Standard channel (fonnte_standard)
  - Priority channel (fonnte_priority)
  - Device management support
* **Email:** Resend API
  - HTML email templates
  - OTP emails
  - Scan alert emails

### Date & Time
* **Date Library:** date-fns 4.1.0
* **Timezone:** Asia/Makassar (WITA)

### Development Tools
* **Linter:** ESLint 9, TypeScript ESLint 8.56.1
* **Script Runner:** TSX 4.21.0
* **Environment:** dotenv 17.3.1
* **Type Definitions:** @types packages for all dependencies

### Deployment & Infrastructure
* **Platform:** Vercel
* **Region:** sin1 (Singapore)
* **Cron Jobs:** Vercel Cron
  - Deadline reminders: 0 8 * * * (setiap jam 8 pagi WITA)
* **Server Actions:** Body size limit 2MB
* **Security Headers:**
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(self)

### TypeScript Configuration
* **Target:** ES2017
* **Module Resolution:** Bundler
* **Path Aliases:**
  - @/* → ./*
  - @/components/* → ./components/*
  - @/lib/* → ./lib/*
  - @/db/* → ./db/*
  - @/app/* → ./app/*

---

## 13. Database Schema (Drizzle ORM)

> **Catatan Penting:** Karena Supabase digunakan oleh aplikasi lain, semua tabel menggunakan prefix `balikin_` dan memiliki `app_id` bernilai `"balikin_id"`.

### Core Tables

```typescript
// Users & Authentication
users - User data (email, name, role, image)
sessions - Session management
accounts - OAuth accounts
verifications - Email/OTP verification

// Tags
balikin_tags - Tag data (slug, owner, status, tier, module)
balikin_scan_logs - Scan history (IP, location, device)

// Module Data
balikin_student_modules - Student kit data
balikin_emergency_info - Emergency medical data
balikin_schedule_shares - Shared schedule codes

// Orders
balikin_sticker_orders - Sticker order tracking
balikin_order_bundles - Bundle-to-order mapping

// Admin
balikin_qr_stocks - QR stock management
```

---

## 14. Aturan Khusus & Business Logic

1. **Privasi Data:**
   * Halaman profil tidak boleh menampilkan nomor HP dalam bentuk teks biasa.
   * Nomor hanya diletakkan di dalam fungsi `window.location.href` pada tombol "Hubungi".

2. **Unique Slug Logic:**
   * Setiap QR menggunakan nanoid 12 karakter (acak dan susah ditebak).
   * Mencegah brute force untuk melihat data orang lain.

3. **Ownership Claim:**
   * Gantungan kunci yang baru dicetak berstatus "Unclaimed".
   * Siapa pun yang pertama kali scan dan login akan menjadi pemilik sah.

4. **Lost Mode Logic:**
   * Jika `status === 'lost'`, halaman publik menampilkan:
     - Warna merah mencolok
     - Tombol hubungi pemilik di posisi paling atas
     - Deteksi lokasi (IP-based)
     - Notifikasi ke pemilik via WhatsApp/email

5. **Free Tier Limit:**
   * User gratis maksimal 5 tag.
   * Premium unlimited sesuai pesanan.

6. **Module Activation:**
   * Admin dapat mengaktifkan modul untuk tag tertentu.
   * Modul aktif menampilkan konten tambahan di halaman profil.

---

## 15. Target Pengembangan MVP (Minimal Viable Product)

### ✅ Sudah Selesai
* **Authentication:** Google OAuth + Email OTP.
* **User Dashboard:** Tag management, lost mode toggle.
* **Admin Dashboard:** Client management, bundle creation, QR stock.
* **Public Profile:** Halaman publik dengan module support.
* **Module System:** Student Kit, Otomotif, Pertanian, Diklat.
* **Sticker Orders:** Order management dengan status tracking.
* **API Routes:** Complete CRUD untuk tags, modules, scans.
* **Mobile UI:** Responsive design untuk mobile.

### 🚧 Sedang Dalam Pengembangan
* **Layout Editor:** Custom sticker design.
* **Advanced Analytics:** Scan heatmap dan location tracking.
* **Push Notifications:** Real-time scan alerts.

### 📋 Rencana Mendatang
* **Premium Features:** Subscription-based premium tracking.
* **Mobile App:** Native app untuk iOS dan Android.
* **Integration:** Partnership dengan ekspedisi/logistik.
* **Insurance:** Asuransi kehilangan berbayar.

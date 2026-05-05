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

## 3. Model Bisnis & Produk

Sistem mendukung empat pilar distribusi fisik ke digital:

### 🏭 3.1 Mass-Retail (Bulk QR)
- **Deskripsi:** Produksi massal gantungan kunci/tag dengan status *unclaimed*
- **Distribusi:** Dijual secara retail melalui berbagai channel penjualan
- **Aktivasi:** Pembeli melakukan klaim setelah pembelian
- **Target Market:** Retail mass market, harga terjangkau
- **Harga:** Rp 29.000 - Rp 35.000

### 🏢 3.2 B2B & Bundling (Niche Markets)
- **Deskripsi:** Paket khusus untuk segmen spesifik dengan branding khusus
- **Bundle Types:**
  - **Student Kit** (🎓): Sekolah, universitas, mahasiswa
  - **Otomotif** (🚗): Komunitas motor, bengkel, pengendara
  - **Pertanian** (🌾): Petani, kelompok tani, distributor
  - **Diklat B2B** (👥): Perusahaan, instansi pelatihan
- **Fitur Tambahan:** Dashboard pemantauan distribusi bagi mitra B2B
- **Harga:** Rp 59.000 - Rp 149.000

### 🎨 3.3 Direct-to-Consumer (D2C Custom)
- **Deskripsi:** Pesanan kustom melalui website
- **Kustomisasi:**
  - Pilihan bentuk akrilik (circle, square, custom shape)
  - Pilihan warna QR code
  - Upload desain/gambar custom
- **Produksi:** On-demand setelah order
- **Status Pengiriman:** *Active* tanpa perlu klaim (langsung aktif)
- **Harga:** Rp 45.000 - Rp 75.000

### 🏷️ 3.4 Sticker Bundles
- **Deskripsi:** Paket stiker yang bisa ditempel mandiri pada barang apapun
- **Variant Packs:**
  - **Small Pack:** 5 stiker - Rp 25.000
  - **Medium Pack:** 10 stiker - Rp 35.000
  - **Large Pack:** 15 stiker - Rp 45.000
  - **Extra Large Pack:** 20 stiker - Rp 50.000
- **Material:** Vinyl waterproof, anti pudar
- **Aktivasi:** Scan untuk klaim

---

## 4. Alur Aplikasi & Alur User

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

## 5. Alur Konversi (Free to Premium Funnel)

1. **Acquisition:** User membuat akun gratis untuk mencoba sistem (misal: untuk wallpaper HP).
2. **Experience:** User merasakan kemudahan Dashboard dan simulasi scan.
3. **The Gap:** User menyadari label cetak sendiri mudah rusak dan tidak terlihat profesional.
4. **Upsell:** Di Dashboard user gratis, muncul banner *"Ubah Tag Digital ini menjadi Gantungan Kunci Akrilik Premium (Cuma Rp35rb)"*.
5. **Conversion:** User melakukan checkout karena data sudah terisi (tidak perlu input ulang).

---

## 6. Core Features (Fitur Utama)

* **Dynamic Redirection:** Mengarahkan satu QR Code ke berbagai aksi berdasarkan status di database.
* **Lost Mode Toggle:** Perubahan tampilan halaman profil secara *real-time* saat barang dinyatakan hilang.
* **WhatsApp Integration:** Tombol "Hubungi Pemilik" yang otomatis membuka chat WA dengan pesan *pre-filled*.
* **Privacy Masking:** Penemu tidak langsung melihat nomor HP di URL, melainkan melalui perantara tombol API WhatsApp.
* **Dashboard User:** Ruang bagi pemilik untuk mengelola banyak tag (jika punya lebih dari satu kunci).
* **Slug Generator:** Menggunakan nanoid 12 karakter untuk keamanan dan ketidakprediktabilan.
* **Verified Owner Badge:** Badge verifikasi untuk pemilik produk premium.
* **Hero Finder Badge:** Badge "Pahlawan Penemu" untuk penemu barang yang menghubungi pemilik.

---

## 7. Module System (Fitur Tambahan per Kategori)

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

## 8. Admin Features (Fitur Admin)

Dashboard dibagi menjadi **dua modul utama** untuk efisiensi operasional:

### 🎯 A. Module: Customer Service (CS) Dashboard

#### **Fokus:** Pelayanan pelanggan dan komunikasi

##### **A1. Order Management**
```
- Incoming Orders Queue
- Payment Verification
- Order Status Updates
- Customer Communication
- Refund/Return Handling
```

##### **A2. Customer Support**
```
- Claim Verification & Assistance
- Manual Token Reset
- Account Management
- Badge Verification (Verified User)
- Complaint Handling
```

##### **A3. Shipping & Fulfillment**
```
- Shipping Label Generation
- Tracking Number Input
- Delivery Status Updates
- Customer Notifications
```

##### **A4. B2B Partner Management**
```
- Partner Dashboard Access
- Distribution Analytics
- Bulk Claim Codes
- White-label Configuration
```

### 🏭 B. Module: Production & Operations Dashboard

#### **Fokus:** Produksi fisik dan inventory management

##### **B1. Batch Generation & Management**
```
- Generate UUID/Serial Number massal
- Batch categorization (Student Kit, Otomotif, dll)
- Batch naming & numbering
- Batch assignment to partners
```

##### **B2. VDP Export (Variable Data Printing)**
```
- QR Code generation in bulk
- PDF export dengan layout siap cetak
- CSV export untuk database produksi
- Template management (A4, A3, custom)
- Auto-layout optimization (12 items/A4, 20 items/A3)
```

##### **B3. Production Queue**
```
- Print Queue Management
- Production Status Tracking
- Quality Control Checkpoints
- Admin Workload Assignment
```

##### **B4. Inventory Management**
```
- Material Stock Tracking (Akrilik, Vinyl)
- Low Stock Alerts
- Material Usage Analytics
- Restock Management
- Supplier Management
```

##### **B5. Quality Control**
```
- QC Checklists
- Defect Tracking
- Quality Metrics
- Return/Defect Analysis
```

---

## 9. Admin UI/UX Principles

### ⚡ 9.1 Efficiency-First Design

#### **Barcode Scanner Integration**
- Dukungan barcode scanner fisik untuk quick lookup
- Quick search: Scan serial number → langsung ke detail tag
- Mobile-friendly untuk operasional lapangan

#### **Keyboard Shortcuts**
```
Ctrl/Cmd + K : Quick Search
Ctrl/Cmd + N : New Order/Batch
Ctrl/Cmd + P : Print Queue
Ctrl/Cmd + S : Save Status
Esc : Close modal/back
```

### 🎨 9.2 Visual Design Principles

#### **Color Coding System**
| Status | Color | Hex Code |
|--------|-------|----------|
| Unclaimed | Gray | #9CA3AF |
| In Production | Blue | #3B82F6 |
| In Transit | Purple | #8B5CF6 |
| Active | Green | #10B981 |
| Lost | Red | #EF4444 |
| Suspended | Orange | #F59E0B |

#### **Status Indicators**
- **Badge System:** Quick visual status identification
- **Progress Bars:** Production completion percentage
- **Toast Notifications:** Real-time updates

### 📱 9.3 Responsive Design
- **Desktop:** Full-featured dashboard dengan sidebar
- **Tablet:** Optimized layout untuk production floor
- **Mobile:** Essential features untuk on-the-go operations

---

## 10. Public Pages

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

## 11. API Routes

### Authentication API
* **Google OAuth:** Sign in dengan Google.
* **Email/WhatsApp OTP:** Verifikasi via email atau WhatsApp.
* **Session Management:** Manajemen sesi user.

### Admin API
* **Tag Creation:** Buat tag untuk user.
* **Module Management:** Kelola modul user.
* **QR Stock:** Kelola stok QR.
* **Tag Management:** CRUD tag.
* **Batch Management:** Generate dan kelola batch produksi.
* **Claim Validation:** Validasi claim token dengan rate limiting.

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

## 12. Strategi "Verified Owner Badge"

Badge ini ditampilkan pada halaman publik yang di-scan oleh penemu (Finder):

* **Tujuan Trust:** Menyakinkan penemu bahwa pemilik adalah orang asli yang terverifikasi.
* **Tujuan Gengsi:** Memberikan kepuasan visual bagi pembeli produk fisik.
* **Tujuan Marketing:** Penemu barang yang melihat badge keren ini akan tertarik untuk memiliki sistem serupa (Finder-to-Buyer Loop).

---

## 13. Monetisasi (Revenue Streams)

1. **Direct Sales:** Penjualan satuan gantungan kunci (Standard: Rp29.000, Premium: Rp35.000).
2. **Sticker Packs:** Stiker vinyl waterproof (Small: Rp25.000, Medium: Rp35.000, Large: Rp45.000, XL: Rp50.000).
3. **Bundle Packages:** Paket tematik (Student Kit: Rp79.000, Otomotif: Rp59.000, Pertanian: Rp69.000, Diklat: Rp149.000).
4. **Corporate/B2B:** Paket custom untuk sekolah, komunitas motor, tour & travel.
5. **Premium Features (SaaS):** Biaya langganan kecil untuk fitur premium tracking history.

---

## 14. Logika Keamanan & Aktivasi (Claim Logic)

Untuk produk non-custom (Bulk & Stiker), sistem mencegah aktivasi ilegal sebelum pembelian.

### 🔐 14.1 Dual-Validation Claim System

#### **Komponen 1: Public ID (Serial Number)**
- Tertera pada QR Code untuk identifikasi publik
- Dapat discan oleh siapa saja
- Mengarah ke halaman profil publik
- **Format:** 12 karakter alphanumeric (Nanoid)

#### **Komponen 2: Secret Token (Claim Code)**
- Kode rahasia 3-4 digit untuk validasi kepemilikan
- Tersembunyi di balik lapisan gosok (*scratch-off*) atau di dalam kemasan
- Hanya dimiliki oleh pembeli sah
- **Hash:** Disimpan dalam bentuk hash di database
- **Format:** 4 digit numeric

### 📊 14.2 Status Tag Lifecycle

| Status | Deskripsi | Use Case |
|--------|-----------|----------|
| **`unclaimed`** | Sudah dicetak, belum ada pemilik | Bulk production, Sticker packs |
| **`in_transit`** | Sedang dikirim, sudah terikat ke user | Custom orders, B2B bulk distribution |
| **`active`** | Sudah diklaim dan profil aktif | Semua produk setelah aktivasi |
| **`lost`** | Barang dinyatakan hilang | User mengaktifkan mode hilang |
| **`suspended`** | Tag dinonaktifkan oleh admin | Pelanggaran atau permintaan user |

### 🛡️ 14.3 Keamanan Aktivasi

#### **Proteksi Brute Force:**
- Maksimal 3 percobaan claim token per IP per jam
- Delay 2 detik antara percobaan
- Block sementara setelah 3 percobaan gagal

#### **Proteksi Duplicasi:**
- Satu claim token hanya valid untuk satu aktivasi
- IP logging untuk setiap percobaan klaim
- Notifikasi ke owner jika ada percobaan mencurigakan

---

## 15. Alur Kerja Operasional (Workflow)

### 🔄 15.1 Alur Bulk Production

```
1. GENERATE BATCH
   └─> Admin generates bulk QR codes
   └─> System creates unique serial numbers + claim tokens
   └─> Batch assigned ID and status: 'production'

2. VDP EXPORT
   └─> Export QR data to PDF/CSV
   └─> Print physical QR codes on acrylic/vinyl
   └─> Apply scratch-off layer on claim tokens

3. DISTRIBUTION
   └─> Package and ship to retailers/partners
   └─> Update batch status to 'distributed'
   └─> Track inventory levels

4. CUSTOMER PURCHASE
   └─> Customer buys physical product
   └─> Receives QR tag with hidden claim token

5. CLAIM PROCESS
   └─> Customer scans QR code
   └─> Directed to claim page
   └─> Enters claim token
   └─> System validates token
   └─> Tag status changes to 'active'
   └─> Customer can now configure profile
```

### 🎨 15.2 Alur Custom Order

```
1. ORDER PLACEMENT
   └─> Customer designs custom QR on website
   └─> Selects shape, color, uploads design
   └─> Completes payment

2. PRODUCTION QUEUE
   └─> Order appears in production dashboard
   └─> Status: 'pending_payment' → 'paid'

3. PRODUCTION
   └─> Admin generates QR with custom specifications
   └─> Tag pre-bound to customer account
   └─> Status: 'in_production'

4. QUALITY CHECK
   └─> QC verification of custom specifications
   └─> Photo documentation (optional)
   └─> Status: 'qc_passed'

5. SHIPPING
   └─> Admin inputs tracking number
   └─> Status changes to 'in_transit'
   └─> Customer receives shipping notification

6. AUTO-ACTIVATION
   └─> Upon delivery confirmation, tag auto-activates
   └─> Status: 'active'
   └─> Customer can immediately use profile
```

### 📦 15.3 Alur Sticker Bundle

```
1. BUNDLE GENERATION
   └─> Admin creates sticker bundle (5, 10, 15, 20 pack)
   └─> Generate multiple QR codes with claim tokens
   └─> Bundle ID assigned

2. PRINTING
   └─> Export to PDF for sticker printing
   └─> Vinyl sticker cutting
   └─> Quality verification

3. PACKAGING
   └─> Pack stickers with claim instructions
   └─> Apply scratch-off stickers on claim codes

4. DISTRIBUTION
   └─> Ship to customer or retail partner

5. INDIVIDUAL CLAIM
   └─> Customer claims each sticker individually
   └─> Can apply to different items
   └─> Each sticker gets unique profile or shared profile
```

---

## 16. Tech Stack

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

## 17. Database Schema (Drizzle ORM)

> **Catatan Penting:** Karena Supabase digunakan oleh aplikasi lain, semua tabel menggunakan prefix `balikin_` dan memiliki `app_id` bernilai `"balikin_id"`.

### Core Tables

```typescript
// Users & Authentication
users - User data (email, name, role, image)
sessions - Session management
accounts - OAuth accounts
verifications - Email/OTP verification

// Tags
balikin_tags - Tag data (slug, owner, status, tier, module, batch_id, claim_token_hash)
balikin_scan_logs - Scan history (IP, location, device)

// Production & Batches
balikin_batches - Batch management (name, type, status, partner_id)

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

### New Tables & Updates

#### **Table: `balikin_batches`**
```sql
CREATE TABLE balikin_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'bulk', 'student_kit', 'otomotif', 'pertanian', 'diklat'
  status VARCHAR(20) DEFAULT 'production', -- 'production', 'distributed', 'completed'
  partner_id UUID REFERENCES balikin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Additional batch information
);
```

#### **Table Updates: `balikin_tags`**
```sql
ALTER TABLE balikin_tags
ADD COLUMN batch_id UUID REFERENCES balikin_batches(id),
ADD COLUMN claim_token_hash VARCHAR(255), -- Hashed secret claim code
ADD COLUMN production_meta JSONB, -- Custom production details (color, shape, etc.)
ADD COLUMN claim_attempts INTEGER DEFAULT 0,
ADD COLUMN last_claim_attempt TIMESTAMP,
ADD COLUMN claim_ip_address INET;
```

### Database Indexes

```sql
-- Performance indexes for production queries
CREATE INDEX idx_tags_batch_id ON balikin_tags(batch_id);
CREATE INDEX idx_tags_status ON balikin_tags(status);
CREATE INDEX idx_tags_claim_token ON balikin_tags(claim_token_hash);
CREATE INDEX idx_batches_type ON balikin_batches(type);
CREATE INDEX idx_batches_status ON balikin_batches(status);
CREATE INDEX idx_scan_logs_created_at ON balikin_scan_logs(created_at DESC);
```

---

## 18. Aturan Khusus & Business Logic

1. **Privasi Data:**
   * Halaman profil tidak boleh menampilkan nomor HP dalam bentuk teks biasa.
   * Nomor hanya diletakkan di dalam fungsi `window.location.href` pada tombol "Hubungi".

2. **Unique Slug Logic:**
   * Setiap QR menggunakan nanoid 12 karakter (acak dan susah ditebak).
   * Mencegah brute force untuk melihat data orang lain.

3. **Ownership Claim:**
   * Gantungan kunci yang baru dicetak berstatus "Unclaimed".
   * Untuk bulk & sticker: Siapa pun yang pertama kali scan dan memasukkan claim token yang benar akan menjadi pemilik sah.
   * Untuk custom: Pre-bound ke pembeli, langsung aktif setelah dikirim.

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

7. **Claim Token Security:**
   * Maksimal 3 percobaan klaim per IP per jam
   - Delay 2 detik antara percobaan
   - Block sementara setelah 3 percobaan gagal
   - IP logging untuk audit trail

---

## 19. Target Pengembangan MVP (Minimal Viable Product)

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

---

## 20. Success Metrics & KPIs

### Production Metrics
- **Production Capacity:** Tags per day
- **QC Pass Rate:** Percentage of products passing quality check
- **Material Efficiency:** Usage vs waste ratio
- **Production Lead Time:** Average time from order to ship

### Customer Service Metrics
- **Claim Success Rate:** First-attempt claim success
- **Response Time:** Average customer inquiry response time
- **Resolution Time:** Average issue resolution time
- **Customer Satisfaction:** CSAT scores

### Business Metrics
- **Monthly Active Users:** Active tag usage
- **Scan Rate:** Tags scanned per day
- **Conversion Rate:** Free to paid conversion
- **Partner Distribution:** B2B partner adoption

---

## 21. Implementation Priority

### Phase 1: Foundation (Week 1-2)
- ✅ Database schema updates
- ✅ Basic role-based dashboard separation
- ✅ Claim token system implementation

### Phase 2: CS Dashboard (Week 3-4)
- ✅ Order management interface
- ✅ Customer support tools
- ✅ Shipping integration

### Phase 3: Production Dashboard (Week 5-6)
- ✅ Batch generation system
- ✅ VDP export functionality
- ✅ Production queue management

### Phase 4: Advanced Features (Week 7-8)
- ✅ B2B partner portal
- ✅ Advanced analytics
- ✅ Mobile optimization

---

**Document Status:** Updated with operational specifications  
**Last Updated:** 2026-05-05  
**Version:** 2.0

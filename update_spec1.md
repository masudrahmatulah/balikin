# Update Spesifikasi Sistem: Strategi Pemasaran & Arsitektur Admin Dashboard

**Project:** Balikin - Smart Lost & Found QR Tag System  
**Document Version:** 1.0  
**Last Updated:** 2026-05-05  
**Status:** Draft Specification

---

## 📋 Table of Contents

1. [Model Bisnis & Produk Baru](#1-model-bisnis--produk-baru)
2. [Logika Keamanan & Aktivasi](#2-logika-keamanan--aktivasi-claim-logic)
3. [Arsitektur Admin Dashboard](#3-arsitektur-admin-dashboard)
4. [Pembaruan Skema Database](#4-pembaruan-skema-database-supabase)
5. [Prinsip UI/UX Admin](#5-prinsip-uiux-admin)
6. [Alur Kerja (Workflow)](#6-alur-kerja-workflow)

---

## 1. Model Bisnis & Produk Baru

Sistem harus mendukung empat pilar distribusi fisik ke digital:

### 🏭 1.1 Mass-Retail (Bulk QR)
- **Deskripsi:** Produksi massal gantungan kunci/tag dengan status *unclaimed*
- **Distribusi:** Dijual secara retail melalui berbagai channel penjualan
- **Aktivasi:** Pembeli melakukan klaim setelah pembelian
- **Target Market:** Retail mass market, harga terjangkau
- **Harga Estimasi:** Rp 29.000 - Rp 35.000

### 🏢 1.2 B2B & Bundling (Niche Markets)
- **Deskripsi:** Paket khusus untuk segmen spesifik dengan branding khusus
- **Bundle Types:**
  - **Student Kit** (🎓): Sekolah, universitas, mahasiswa
  - **Otomotif** (🚗): Komunitas motor, bengkel, pengendara
  - **Pertanian** (🌾): Petani, kelompok tani, distributor
  - **Diklat B2B** (👥): Perusahaan, instansi pelatihan
- **Fitur Tambahan:** Dashboard pemantauan distribusi bagi mitra B2B
- **Harga Estimasi:** Rp 59.000 - Rp 149.000

### 🎨 1.3 Direct-to-Consumer (D2C Custom)
- **Deskripsi:** Pesanan kustom melalui website
- **Kustomisasi:**
  - Pilihan bentuk akrilik (circle, square, custom shape)
  - Pilihan warna QR code
  - Upload desain/gambar custom
- **Produksi:** On-demand setelah order
- **Status Pengiriman:** *Active* tanpa perlu klaim (langsung aktif)
- **Harga Estimasi:** Rp 45.000 - Rp 75.000

### 🏷️ 1.4 Sticker Bundles
- **Deskripsi:** Paket stiker yang bisa ditempel mandiri pada barang apapun
- **Variant Packs:**
  - **Small Pack:** 5 stiker - Rp 25.000
  - **Medium Pack:** 10 stiker - Rp 35.000
  - **Large Pack:** 15 stiker - Rp 45.000
  - **Extra Large Pack:** 20 stiker - Rp 50.000
- **Material:** Vinyl waterproof, anti pudar
- **Aktivasi:** Scan untuk klaim

---

## 2. Logika Keamanan & Aktivasi (Claim Logic)

Untuk produk non-custom (Bulk & Stiker), sistem harus mencegah aktivasi ilegal sebelum pembelian.

### 🔐 2.1 Dual-Validation Claim System

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

### 📊 2.2 Status Tag Lifecycle

| Status | Deskripsi | Use Case |
|--------|-----------|----------|
| **`unclaimed`** | Sudah dicetak, belum ada pemilik | Bulk production, Sticker packs |
| **`in_transit`** | Sedang dikirim, sudah terikat ke user | Custom orders, B2B bulk distribution |
| **`active`** | Sudah diklaim dan profil aktif | Semua produk setelah aktivasi |
| **`lost`** | Barang dinyatakan hilang | User mengaktifkan mode hilang |
| **`suspended`** | Tag dinonaktifkan oleh admin | Pelanggaran atau permintaan user |

### 🛡️ 2.3 Keamanan Aktivasi

#### **Proteksi Brute Force:**
- Maksimal 3 percobaan claim token per IP per jam
- Delay 2 detik antara percobaan
- Block sementara setelah 3 percobaan gagal

#### **Proteksi Duplicasi:**
- Satu claim token hanya valid untuk satu aktivasi
- IP logging untuk setiap percobaan klaim
- Notifikasi ke owner jika ada percobaan mencurigakan

---

## 3. Arsitektur Admin Dashboard

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

## 4. Pembaruan Skema Database (Supabase)

### 📊 4.1 New Tables

#### **Table: `batches`**
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

### 🔗 4.2 Database Indexes

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

## 5. Prinsip UI/UX Admin

### ⚡ 5.1 Efficiency-First Design

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

### 🎨 5.2 Visual Design Principles

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

### 📱 5.3 Responsive Design
- **Desktop:** Full-featured dashboard dengan sidebar
- **Tablet:** Optimized layout untuk production floor
- **Mobile:** Essential features untuk on-the-go operations

---

## 6. Alur Kerja (Workflow)

### 🔄 6.1 Alur Bulk Production

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

### 🎨 6.2 Alur Custom Order

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

### 📦 6.3 Alur Sticker Bundle

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

## 🎯 Success Metrics & KPIs

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

## 🚀 Implementation Priority

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

**Document Status:** Ready for Implementation  
**Next Steps:** Technical specification breakdown, API design, UI wireframes
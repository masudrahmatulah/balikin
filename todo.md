# TODO List - Balikin (Smart Lost & Found QR Tag)

> **Catatan Penting:** Semua tabel database harus menggunakan prefix `balikin_` dan memiliki `app_id` bernilai `"balikin_id"` karena Supabase digunakan bersama dengan aplikasi lain.

---

## Phase 1: Project Setup & Infrastructure ✅ COMPLETED

### 1.1 Next.js Project Initialization
- [x] Initialize Next.js 15 dengan App Router
- [x] Setup TypeScript dengan strict mode
- [x] Install dan konfigurasi Tailwind CSS
- [x] Setup ESLint dan Prettier

### 1.2 Supabase & Drizzle Setup
- [x] Connect ke Supabase PostgreSQL (existing project)
- [x] Install Drizzle ORM dan dependencies
- [x] Buat file `drizzle.config.ts`
- [x] Setup environment variables (`.env.local`)
- [x] Buat folder structure untuk database (`db/schema.ts`)

### 1.3 UI Components Setup
- [x] Install shadcn/ui
- [x] Install Lucide React icons
- [x] Setup base UI components (Button, Card, Input, etc.)

---

## Phase 2: Database Schema & Migrations ⏳ IN PROGRESS

### 2.1 Core Tables (dengan prefix `balikin_`)
- [x] Buat tabel `balikin_tags`
  - `id` (uuid, primary key)
  - `app_id` (text, default: "balikin_id")
  - `slug` (text, unique, nanoid)
  - `owner_id` (text, nullable, references Better Auth users)
  - `name` (text, not null)
  - `status` (text, default: "normal") → "normal" | "lost"
  - `contact_whatsapp` (text, nullable)
  - `custom_message` (text, nullable)
  - `reward_note` (text, nullable)
  - `created_at` (timestamp, default: now())

- [x] Buat tabel `balikin_scan_logs`
  - `id` (uuid, primary key)
  - `app_id` (text, default: "balikin_id")
  - `tag_id` (uuid, references balikin_tags.id)
  - `scanned_at` (timestamp, default: now())
  - `ip_address` (text, nullable)
  - `city` (text, nullable)
  - `latitude` (text, nullable)
  - `longitude` (text, nullable)

### 2.2 Migrations
- [x] Generate migration files
- [x] Buat SQL script untuk Supabase (`drizzle/supabase_migration.sql`)
- [ ] **PENTING: Jalankan migration di Supabase SQL Editor**
  1. Buka Supabase Dashboard → SQL Editor
  2. Copy contents dari `drizzle/supabase_migration.sql`
  3. Paste dan Run
  4. Verifikasi tabel terbuat dengan query di bagian bawah file
- [ ] (Optional) Push via drizzle-cli setelah koneksi stabil

---

## Phase 3: Authentication (Better Auth) ✅ COMPLETED

### 3.1 Better Auth Setup
- [x] Install Better Auth
- [x] Konfigurasi Better Auth dengan Supabase adapter (`lib/auth.ts`)
- [x] Setup email OTP provider
- [x] WhatsApp OTP - fallback ke email (for future)

### 3.2 Auth Pages
- [x] Buat halaman Sign-in (`/sign-in`)
- [x] Buat halaman Sign-up (`/sign-up`)
- [x] Buat halaman OTP Verification (`/verify-otp`)
- [x] Middleware untuk protected routes
- [x] API route handler (`app/api/[[...catchAll]]/route.ts`)
- [x] Server-side session helpers (`lib/session.ts`)

---

## Phase 4: Core Features - Tag Management ✅ COMPLETED

### 4.1 Tag Generation System
- [x] Buat Server Action untuk generate slug unik (nanoid) - `app/actions/tag.ts:createTag()`
- [x] Buat fungsi generate QR Code (preview di dashboard) - `qrcode` package
- [x] URL structure: `/p/[slug]`

### 4.2 Tag Claim Mechanism
- [x] Buat alur "Unclaimed Tag" → "Claimed Tag" - `app/actions/tag.ts:claimTag()`
- [x] User scan QR pertama kali → redirect ke halaman claim - `/claim/[tagId]`
- [x] Setelah login, tag terhubung ke akun user
- [x] Claim CTA component untuk unclaimed tags

---

## Phase 5: Public Profile Page (`/p/[slug]`) ✅ COMPLETED

### 5.1 Normal Mode UI
- [x] Tampilan profil ramah dan bersahabat
- [x] Pesan sapaan personal
- [x] Tombol "Hubungi Pemilik" ke WhatsApp

### 5.2 Lost Mode UI
- [x] Tampilan darurat (warna merah mencolok)
- [x] Tombol WhatsApp di posisi paling atas
- [x] Info imbalan/reward (jika ada)
- [x] Pesan yang menggugah empati penemu
- [x] Riwayat scan terakhir

### 5.3 Privacy Protection
- [x] Nomor WhatsApp TIDAK dirender sebagai teks statis
- [x] Gunakan tombol dengan `window.open()` ke API WhatsApp - `components/whatsapp-button.tsx`
- [x] Pesan pre-filled saat membuka chat

---

## Phase 6: Scan Logging (Vercel Headers) ✅ COMPLETED

### 6.1 Geo-location Detection
- [x] Implementasi pembacaan Vercel Headers - `app/actions/scan.ts`
  - `x-vercel-ip-city`
  - `x-vercel-ip-country`
  - `x-vercel-ip-latitude`
  - `x-vercel-ip-longitude`
- [x] Server Action untuk mencatat log scan - `logScan()`

### 6.2 Lost Mode Tracking
- [x] Saat status "lost", otomatis log setiap scan - `app/p/[slug]/page.tsx`
- [x] Simpan data lokasi kasar ke `balikin_scan_logs`
- [ ] Kirim notifikasi ke pemilik (WA/Email) saat barang di-scan (Future)

---

## Phase 7: User Dashboard ✅ COMPLETED

### 7.1 Dashboard Layout
- [x] Header navigation (mobile responsive)
- [x] Protected route dengan middleware

### 7.2 Tag List View
- [x] Tampilkan semua tag milik user - `app/dashboard/page.tsx`
- [x] Status badge (Normal / Lost)
- [x] Quick actions: Edit status, Lihat detail

### 7.3 Tag Detail & Edit
- [x] Form edit nama tag - `components/tag-card.tsx`
- [x] Form edit nomor WhatsApp
- [x] Form edit pesan khusus
- [x] Form edit reward note
- [x] Toggle Lost/Normal Mode
- [x] Preview QR Code - `app/dashboard/tag/[slug]/page.tsx`

### 7.4 Scan History View
- [x] Daftar riwayat scan untuk tiap tag
- [x] Tampilkan lokasi (kota) dan waktu

---

## Phase 8: Landing Page & Marketing ✅ COMPLETED

### 8.1 Public Landing Page
- [x] Hero section dengan value proposition
- [x] Cara kerja (step-by-step)
- [x] Benefits section
- [x] Pricing / CTA untuk beli
- [x] FAQ section (8 pertanyaan)

### 8.2 Order Flow (Basic)
- [x] Integrasi WhatsApp untuk pemesanan (MVP)

---

## Phase 9: Testing & Deployment ✅ COMPLETED

### 9.1 Testing
- [ ] Unit test untuk Server Actions (Future)
- [ ] Integration test untuk database operations (Future)
- [ ] E2E test untuk critical flows (Future)
- [x] Build test - Production build berhasil ✓

### 9.2 Deployment
- [x] Setup Vercel project configuration (`vercel.json`)
- [x] Update `next.config.ts` untuk production
- [x] Environment variables template (`.env.production.example`)
- [x] Deployment guide (`DEPLOYMENT.md`)
- [x] Build berhasil dengan 0 errors
- [ ] Configure environment variables di Vercel (Manual step)
- [ ] Setup custom domain (Optional)
- [ ] Run migrations di production (Manual step via Supabase SQL Editor)
- [ ] Setup Vercel project
- [ ] Configure environment variables di Vercel
- [ ] Setup custom domain (jika ada)
- [ ] Run migrations di production

---

## Phase 10: Future Enhancements (Post-MVP)

- [ ] Multi-language support (English/Indonesia)
- [ ] Push notifications untuk scan alerts
- [ ] Share ke sosial media saat mode Lost
- [ ] Statistik dan analytics dashboard
- [ ] Dark mode support
- [ ] Integration dengan marketplace untuk penjualan

---

## Dependencies Check

### Core Dependencies
```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "drizzle-orm": "^0.29.0",
  "drizzle-kit": "^0.20.0",
  "better-auth": "latest",
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest (shadcn)",
  "lucide-react": "^0.300.0",
  "nanoid": "^5.0.0",
  "qrcode.react": "^3.1.0"
}
```

---

## Environment Variables Template

```env
# Supabase
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ID="balikin_id"

# WhatsApp (optional, untuk notifikasi)
WHATSAPP_API_TOKEN=
```

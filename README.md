# Balikin - Smart Lost & Found QR Tag

Platform Smart Lost & Found yang menghubungkan objek fisik (gantungan kunci/tag) dengan identitas digital dinamis.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle ORM (Type-safe queries)
- **Authentication:** Better Auth (Email OTP)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui & Lucide React icons

## Project Structure

```
D:\4WP\balikin\
├── app/
│   ├── api/auth/[...all]/route.ts    # Better Auth API handler
│   ├── p/[slug]/page.tsx              # Public profile (conditional UI based on status)
│   ├── dashboard/
│   │   ├── page.tsx                   # User dashboard
│   │   ├── new/page.tsx               # Create new tag
│   │   └── tag/[slug]/page.tsx        # Tag detail with QR code
│   ├── claim/[tagId]/page.tsx         # Claim unclaimed tags
│   ├── actions/
│   │   ├── scan.ts                    # Scan logging server action
│   │   └── tag.ts                     # Tag management server actions
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Landing page
├── components/
│   ├── ui/                            # shadcn/ui components
│   ├── whatsapp-button.tsx            # Privacy-focused WhatsApp button
│   └── tag-card.tsx                   # Tag card component
├── db/
│   ├── schema.ts                      # Drizzle schema with balikin_ prefix
│   └── index.ts                       # DB connection
├── lib/
│   ├── auth.ts                        # Better Auth config
│   └── utils.ts                       # Utility functions
├── drizzle.config.ts                  # Drizzle Kit configuration
└── .env.local                         # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[password]@[host].supabase.co:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Database Setup

Generate and push the database schema:

```bash
# Generate migration
npm run db:generate

# Push schema to Supabase
npm run db:push

# (Optional) Open Drizzle Studio
npm run db:studio
```

For an existing Supabase database that was already used before the sticker/acrylic rollout, do not rerun the full baseline schema blindly. Apply the incremental SQL files in order from the `drizzle/` folder:

```sql
-- 1. Scan alert preferences
drizzle/0005_scan_alert_preferences.sql

-- 2. Sticker bundle + bundle_id/product_type columns
drizzle/0006_sticker_vinyl_mvp.sql

-- 3. Priority WhatsApp notification logs
drizzle/0007_priority_whatsapp_notification.sql
```

These three files are written to be safe for an existing database and should be run in Supabase SQL Editor in that exact order.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Features

### 1. Dynamic Redirection (`/p/[slug]`)
- **Status 'normal':** Tampilan ramah dengan foto keluarga/owner
- **Status 'lost':** UI darurat (merah), tombol WhatsApp mencolok, info imbalan

### 2. Implicit Tracking
- Saat halaman `/p/[slug]` diakses dengan status 'lost', sistem mencatat:
  - IP Address
  - Kota (dari Vercel Headers)
  - Koordinat kasar (latitude, longitude)

### 3. Privacy First
- Nomor WhatsApp tidak dirender sebagai teks statis
- Tombol memicu `window.open` ke WhatsApp API

### 4. Claim Mechanism
- Tag yang diproduksi vendor bersifat 'unclaimed' (ownerId is null)
- User yang melakukan scan pertama dan login akan 'mengklaim' tag

### 5. User Dashboard
- Daftar tag milik user
- Toggle status normal/lost
- Riwayat scan dengan lokasi

## Database Schema

Semua tabel menggunakan prefix `balikin_` dan `app_id` untuk multi-tenant Supabase:

- `balikin_tags` - Data setiap unit gantungan kunci
- `balikin_scan_logs` - Riwayat scan untuk deteksi lokasi
- `balikin_user` - User accounts (Better Auth)
- `balikin_session` - User sessions (Better Auth)
- `balikin_account` - OAuth accounts (Better Auth)
- `balikin_verification` - OTP verification (Better Auth)

## License

MIT

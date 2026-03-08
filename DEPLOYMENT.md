# Deployment Guide - Balikin

## Prerequisites

1. **Supabase Project** - Database sudah disiapkan
2. **Vercel Account** - Untuk hosting
3. **GitHub Repository** - Untuk CI/CD (opsional tapi direkomendasikan)

---

## Step 1: Database Setup (Supabase)

### 1.1 Run Migration SQL

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Masuk ke **SQL Editor**
4. Copy isi dari `drizzle/supabase_migration.sql`
5. Paste dan klik **Run**
6. Verifikasi tabel terbuat:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name LIKE 'balikin_%';
   ```

### 1.2 Get Database URL

1. Di Supabase Dashboard → **Project Settings** → **Database**
2. Copy **Connection String** (Direct/Pooler)
3. Format: `postgresql://postgres.[ref]:[password]@[project].supabase.co:5432/postgres`

---

## Step 2: Deploy ke Vercel

### 2.1 Via Vercel Dashboard

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New Project**
3. Import dari GitHub atau upload folder
4. Configure:

   | Environment Variable | Value |
   |---------------------|-------|
   | `DATABASE_URL` | Supabase connection string |
   | `BETTER_AUTH_SECRET` | Generate random string (min 32 chars) |
   | `BETTER_AUTH_URL` | Your Vercel domain |
   | `NEXT_PUBLIC_BETTER_AUTH_URL` | Your Vercel domain |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel domain |

5. Klik **Deploy**

### 2.2 Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production
```

---

## Step 3: Post-Deployment Verification

### 3.1 Check Database Connection

1. Buka aplikasi
2. Coba sign up dengan email
3. Cek di Supabase: **Table Editor** → `balikin_user`
4. Pastikan user terbuat

### 3.2 Test Core Flows

| Flow | Test Steps |
|------|------------|
| Sign Up | `/sign-up` → Masukkan email → Cek console untuk OTP |
| Sign In | `/sign-in` → Masukkan email → OTP |
| Create Tag | `/dashboard/new` → Buat tag |
| Public Profile | Buka `/p/[slug]` |
| Claim Tag | Scan QR untuk unclaimed tag |
| Lost Mode | Toggle status di dashboard |

### 3.3 Test Vercel Headers (Geo-location)

Vercel otomatis menambahkan headers ini di production:
- `x-vercel-ip-city`
- `x-vercel-ip-country`
- `x-vercel-ip-latitude`
- `x-vercel-ip-longitude`

Test dengan:
1. Set status tag ke "Hilang"
2. Akses `/p/[slug]` dari device berbeda/VPN
3. Cek dashboard untuk riwayat scan dengan lokasi

---

## Step 4: Custom Domain (Optional)

1. Di Vercel Dashboard → **Settings** → **Domains**
2. Add custom domain
3. Update DNS records sesuai instruksi
4. Update environment variables dengan domain baru:
   - `BETTER_AUTH_URL=https://your-domain.com`
   - `NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com`
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`

---

## Step 5: Monitor Production

### 5.1 Vercel Analytics

- Cek di [Vercel Dashboard](https://vercel.com/dashboard)
- Monitor: performance, errors, build logs

### 5.2 Supabase Logs

- Cek di Supabase Dashboard → **Logs**
- Monitor query performance dan errors

---

## Troubleshooting

### Issue: Database Connection Timeout

**Solusi:** Gunakan Supabase Pooler untuk aplikasi:
```
postgresql://postgres.[ref]:[password]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### Issue: Auth Session Expired

**Solusi:** Pastikan `BETTER_AUTH_SECRET` sama di server dan client, dan URL sudah benar.

### Issue: Migration Belum Jalan

**Solusi:** Jalankan manual via SQL Editor, file ada di `drizzle/supabase_migration.sql`

### Issue: Geo-location Tidak Muncul

**Solusi:** Headers Vercel hanya aktif di production, tidak di localhost.

---

## Security Checklist

- [ ] `BETTER_AUTH_SECRET` menggunakan string random yang kuat
- [ ] `DATABASE_URL` tidak commit ke repository
- [ ] Enable RLS (Row Level Security) di Supabase jika perlu
- [ ] Set up rate limiting untuk API routes
- [ ] Enable HTTPS only (otomatis di Vercel)
- [ ] Review dan test CORS settings

# 🚀 Deploy Balikin ke Vercel - Complete Guide

## ✅ Checklist Sebelum Deploy

- [x] Database Supabase sudah diset
- [x] Resend API key sudah didapat
- [x] Code sudah di-push ke GitHub
- [ ] Domain custom sudah diset (opsional)
- [ ] Environment variables sudah siap

---

## 📦 Step-by-Step Deploy ke Vercel

### Step 1: Persiapan Environment Variables

Buat file `.env.production` (jangan di-commit, hanya untuk referensi):

```bash
# Copy dari .env.example
cp .env.example .env.production

# Edit dan isi dengan nilai sebenarnya
```

### Step 2: Deploy via Vercel Dashboard

1. **Buka** https://vercel.com/new
2. **Import** repository GitHub Anda
3. **Framework Preset**: Next.js (auto-detected)
4. **Build Command**: `next build` (default)
5. **Output Directory**: `.next` (default)

### Step 3: Set Environment Variables di Vercel

Di halaman **Environment Variables**, isi:

```bash
# DATABASE
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# APP
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://balikin.vercel.app

# BETTER AUTH
BETTER_AUTH_SECRET=<generate-random-string-64-chars>
BETTER_AUTH_URL=https://balikin.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://balikin.vercel.app

# EMAIL (RESEND)
RESEND_API_KEY=re_G3jwz4vK_MpXy9bKgEzNDuFhTYjzq4W1u
EMAIL_FROM="Balikin <noreply@balikin.masudrahmat.my.id>"

# WHATSAPP (FONNTE) - Optional
FONNTE_API_TOKEN=your_fonnte_token
FONNTE_DEVICE_ID=your_device_id
FONNTE_BASE_URL=https://api.fonnte.com
WHATSAPP_ORDER_NUMBER=6282255905612
```

**Generate BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 48
```

### Step 4: Deploy

Klik **Deploy** dan tunggu sekitar 2-3 menit.

---

## 🔧 Deploy via Vercel CLI (Alternative)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login ke Vercel
vercel login

# 3. Deploy (first time)
vercel

# 4. Set environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
vercel env add BETTER_AUTH_URL
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM

# 5. Deploy to production
vercel --prod
```

---

## 🌐 Setup Custom Domain (Opsional)

Jika Anda punya domain custom (misal: `balikin.masudrahmat.my.id`):

### Option 1: Via Vercel Dashboard

1. **Project Settings** → **Domains**
2. **Add Domain**: `balikin.masudrahmat.my.id`
3. **Update DNS Records** di domain provider:
   ```
   Type: CNAME
   Name: balikin
   Value: cname.vercel-dns.com
   ```
4. **Tunggu verifikasi** (bisa beberapa menit - jam)

### Option 2: Via Vercel CLI

```bash
vercel domains add balikin.masudrahmat.my.id
```

---

## ✉️ Setup Resend untuk Production

### 1. Verify Domain di Resend

Agar email tidak masuk spam:

1. **Login** ke https://resend.com/dashboard
2. **Domains** → **Add Domain**
3. Masukkan: `balikin.masudrahmat.my.id`
4. **Tambahkan DNS records** yang diberikan Resend ke domain provider Anda
5. **Klik Verify**

### 2. Test Email Production

Setelah deploy, test email OTP:

```bash
# Ganti dengan URL Vercel Anda
curl -X POST https://balikin.vercel.app/api/auth/email-otp/send-verification-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "type": "sign-in"
  }'

# Expected response:
# {"success":true,"message":"OTP sent successfully"}
# (tanpa otp field di production!)
```

Cek inbox email Anda untuk kode OTP.

---

## 🔒 Security Checklist untuk Production

### ✅ Environment Variables

- [x] `DATABASE_URL` - Connection string Supabase
- [x] `BETTER_AUTH_SECRET` - Random secure string (min 32 chars)
- [x] `BETTER_AUTH_URL` - URL production Anda
- [x] `RESEND_API_KEY` - API key Resend
- [x] `EMAIL_FROM` - Email pengirim

### ✅ Database Security

```sql
-- Di Supabase SQL Editor, pastikan Row Level Security (RLS) aktif:
ALTER TABLE balikin_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE balikin_scan_logs ENABLE ROW LEVEL SECURITY;

-- Policy: User hanya bisa akses tag milik sendiri
CREATE POLICY "Users can view own tags" ON balikin_tags
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update own tags" ON balikin_tags
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own tags" ON balikin_tags
  FOR DELETE USING (owner_id = auth.uid());
```

### ✅ Better Auth Cookie Settings

Sudah dikonfigurasi dengan benar:
- ✅ `httpOnly: true` - Cookie tidak bisa diakses JavaScript
- ✅ `secure: true` - Hanya dikirim via HTTPS (production)
- ✅ `sameSite: "lax"` - Proteksi CSRF

---

## 🧪 Testing Setelah Deploy

### 1. Test Landing Page
```
https://balikin.vercel.app
```

### 2. Test Sign-In dengan Email
```
https://balikin.vercel.app/sign-in
```
- Masukkan email Anda
- Cek inbox untuk OTP
- Masukkan OTP
- Harusnya redirect ke dashboard

### 3. Test Dashboard
```
https://balikin.vercel.app/dashboard
```
- Harus bisa akses setelah login
- Test buat tag baru
- Test toggle lost mode

### 4. Test Public Tag Page
```
https://balikin.vercel.app/p/{slug}
```
- Harus bisa diakses tanpa login
- Test mode normal vs lost

### 5. Test Sign-Out
- Klik tombol "Keluar"
- Harusnya redirect ke homepage
- Cookie terhapus
- Tidak bisa akses /dashboard lagi

---

## 🐛 Troubleshooting

### Build Failed

**Cek logs:**
```bash
vercel logs
```

**Common issues:**
- Missing environment variables → Tambahkan di Vercel dashboard
- TypeScript errors → Fix dulu di local, baru deploy lagi
- Dependencies missing → `npm install` dulu

### Email OTP Tidak Terkirim

**Cek:**
1. Vercel Function Logs: `vercel logs`
2. Resend Dashboard → Emails (cek status)
3. Pastikan domain sudah verified di Resend

**Fix:**
```bash
# Cek apakah RESEND_API_KEY benar
vercel env ls
```

### Database Connection Error

**Cek:**
1. Supabase dashboard → Connection pool
2. Pastikan IP Vercel di-whitelist (jika perlu)
3. Cek format `DATABASE_URL`

**Fix:**
- Restart Supabase connection pool
- Cek apakah database masih aktif

### 404 on API Routes

**Fix:**
```bash
# Clear cache dan rebuild
rm -rf .next
vercel --prod --force
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
```bash
# Enable analytics di dashboard
# Project Settings → Analytics → Enable
```

### Resend Email Stats
```
https://resend.com/dashboard → Emails
- Sent
- Delivered  
- Bounced
- Opened
```

### Supabase Database Stats
```
Supabase Dashboard → Database → Reports
- Table sizes
- Query performance
- Connection count
```

---

## 🔄 Update Setelah Deploy

Setiap kali ada perubahan code:

```bash
# Option 1: Git (Recommended)
git add .
git commit -m "fix: something"
git push origin main
# Vercel auto-deploy!

# Option 2: Manual CLI
vercel --prod
```

---

## 💡 Tips untuk Production

### 1. Use Preview Deployments
Setiap pull request dapat URL sendiri. Test dulu sebelum merge!

### 2. Set Up Alerts
Vercel Dashboard → Project Settings → Notifications

### 3. Backup Database Regularly
Supabase → Database → Backups → Enable automated backups

### 4. Monitor Email Usage
Resend free tier: 3,000 emails/month. Upgrade kalau perlu lebih.

### 5. Use Edge Functions (Optional)
Untuk performance, pindahkan middleware ke Edge:
```typescript
// middleware.ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
// Already configured!
```

---

## 📞 Support

Jika ada masalah:
1. Cek logs: `vercel logs`
2. Cek Resend dashboard
3. Cek Supabase dashboard
4. Review dokumentasi: 
   - Vercel: https://vercel.com/docs
   - Better Auth: https://www.better-auth.com
   - Resend: https://resend.com/docs

# 📧 Setup Email OTP - Balikin

## ✅ Konfigurasi Saat Ini

### Development (.env.local)
```bash
RESEND_API_KEY="re_G3jwz4vK_MpXy9bKgEzNDuFhTYjzq4W1u"
FORCE_SEND_EMAIL="true"
EMAIL_FROM="Balikin <noreply@balikin.masudrahmat.my.id>"
```

### Production (Vercel Environment Variables)
Environment variables yang perlu ditambahkan di Vercel Dashboard:

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_URL="https://balikin.masudrahmat.my.id"
NEXT_PUBLIC_BETTER_AUTH_URL="https://balikin.masudrahmat.my.id"

# Email (Resend)
RESEND_API_KEY="re_G3jwz4vK_MpXy9bKgEzNDuFhTYjzq4W1u"
EMAIL_FROM="Balikin <noreply@balikin.masudrahmat.my.id>"

# Optional: WhatsApp (Fonnte)
FONNTE_API_KEY="your-fonnte-api-key"
```

---

## 🧪 Test Email OTP

### Test Lokal (Development Mode)

Karena `FORCE_SEND_EMAIL=true`, email akan dikirim sungguhan meski di development:

```bash
# Start dev server
npm run dev

# Buka browser: http://localhost:3000/sign-in
# Masukkan email Anda
# Cek inbox email untuk kode OTP
```

### Test Production (Setelah Deploy ke Vercel)

1. Deploy ke Vercel
2. Pastikan semua environment variables sudah diset
3. Buka URL production Anda
4. Test sign-in dengan email
5. Cek inbox email

---

## 📋 Verifikasi Resend Domain (PENTING!)

Agar email tidak masuk spam, Anda perlu verify domain di Resend:

### Langkah 1: Login ke Resend Dashboard
1. Buka https://resend.com/dashboard
2. Login ke akun Anda
3. Pergi ke **Domains** di sidebar kiri

### Langkah 2: Tambah Domain
1. Klik **Add Domain**
2. Masukkan domain: `balikin.masudrahmat.my.id`
3. Resend akan memberikan DNS records yang perlu ditambahkan

### Langkah 3: Update DNS Records
Tambahkan DNS records berikut di domain provider Anda (Cloudflare, Namecheap, dll):

```
# Contoh records dari Resend:
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb...

Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10
```

### Langkah 4: Verifikasi
Setelah DNS records ditambahkan, klik **Verify** di Resend Dashboard.

---

## 🚀 Deploy ke Vercel

### Cara 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_URL
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL
```

### Cara 2: Vercel Dashboard (Recommended)

1. Push code ke GitHub
2. Buka https://vercel.com/new
3. Import repository GitHub Anda
4. Di halaman **Environment Variables**, tambahkan semua env vars
5. Klik **Deploy**

---

## 🔧 Environment Variables untuk Vercel

### Dari Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production |
| `RESEND_API_KEY` | `re_G3jwz4vK_...` | Production |
| `EMAIL_FROM` | `Balikin <noreply@balikin.masudrahmat.my.id>` | Production |
| `BETTER_AUTH_URL` | `https://balikin.masudrahmat.my.id` | Production |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://balikin.masudrahmat.my.id` | Production |
| `FONNTE_API_KEY` | `your-fonnte-key` | Production (optional) |
| `NEXT_PUBLIC_APP_URL` | `https://balikin.masudrahmat.my.id` | Production |

**Penting:** Jangan set `FORCE_SEND_EMAIL` di production! Biarkan hanya ada di `.env.local` untuk development.

---

## ✉️ Email Templates

Aplikasi menggunakan template email yang sudah profesional dengan:

- ✅ Branding "Balikin"
- ✅ OTP dalam format besar dan jelas
- ✅ Warning keamanan
- ✅ Responsive design
- ✅ Support untuk:
  - Sign-in OTP
  - Email verification OTP
  - Forget password OTP
  - Scan alert notifications

---

## 🐛 Troubleshooting

### Email Tidak Terkirim

**Cek logs di Vercel:**
```bash
vercel logs
```

**Error umum:**
- `RESEND_API_KEY` tidak valid → Cek di Resend dashboard
- Domain belum verified → Tambah DNS records
- Rate limit exceeded → Cek usage di Resend dashboard

### Email Masuk Spam

**Solusi:**
1. Verify domain di Resend
2. Tambahkan SPF, DKIM, DMARC records
3. Gunakan custom domain (jangan pakai domain gratisan)

### OTP Tidak Sampai Tapi Log Berhasil

**Cek:**
- Spam/Junk folder
- Promotions folder (Gmail)
- Email typo (cek input user)

---

## 📊 Email Usage Statistics

Free tier Resend:
- **3,000 emails/bulan** gratis
- **100 emails/hari** limit

Untuk production dengan traffic tinggi, upgrade ke paid plan atau gunakan provider lain.

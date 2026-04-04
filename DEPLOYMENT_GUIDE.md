# 🚀 Vercel Deployment Guide

## Quick Setup - Copy & Paste Environment Variables

### Step 1: Get Your Environment Variables Ready

**Your Custom Domain:** `balikin.masudrahmat.my.id`

Copy the values below (already configured with actual values):

```bash
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:Kandangan01***@db.piqyqhzxjayakiucfubu.supabase.co:5432/postgres

# App URL (IMPORTANT: Use your custom domain!)
NEXT_PUBLIC_APP_URL=https://balikin.masudrahmat.my.id
NODE_ENV=production

# Auth (generate secret: openssl rand -base64 32)
BETTER_AUTH_SECRET=ZJx+9Ro2u9TXPXHqryH7N9LkfFyJ7aJZlXkJ48UstGI=
BETTER_AUTH_URL=https://balikin.masudrahmat.my.id
NEXT_PUBLIC_BETTER_AUTH_URL=https://balikin.masudrahmat.my.id

# Email (from Resend.com)
RESEND_API_KEY=re_re_aECFg5pX_47BJHpL22y22399nqY3e6g1x

# WhatsApp (from Fonnte.com)
FONNTE_API_TOKEN=bd4wyhuNRsmvKHJa1uG8
FONNTE_DEVICE_ID=087883956811
FONNTE_BASE_URL=https://api.fonnte.com
FONNTE_PRIORITY_API_TOKEN=bd4wyhuNRsmvKHJa1uG8
FONNTE_PRIORITY_DEVICE_ID=087883956811
FONNTE_PRIORITY_BASE_URL=https://api.fonnte.com
WHATSAPP_ORDER_NUMBER=6282255905612
WHATSAPP_PROVIDER_STANDARD=fonnte_standard
WHATSAPP_PROVIDER_PRIORITY=fonnte_priority
```

---

## Step 2: Deploy to Vercel

### Option A: Automatic Deploy (Recommended)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub: `masudrahmatulah/balikin`
4. Vercel will auto-detect Next.js
5. Configure environment variables (see Step 3)
6. Click "Deploy"

### Option B: Manual Deploy

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

---

## Step 3: Configure Environment Variables in Vercel

### Via Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `balikin`
3. Go to: Settings → Environment Variables
4. Add each variable:

**Required Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://postgres:Kandangan01***@db.piqyqhzxjayakiucfubu.supabase.co:5432/postgres` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://balikin.masudrahmat.my.id` | All |
| `NODE_ENV` | `production` | All |
| `BETTER_AUTH_SECRET` | `ZJx+9Ro2u9TXPXHqryH7N9LkfFyJ7aJZlXkJ48UstGI=` | All |
| `BETTER_AUTH_URL` | `https://balikin.masudrahmat.my.id` | All |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://balikin.masudrahmat.my.id` | All |
| `RESEND_API_KEY` | `re_re_aECFg5pX_47BJHpL22y22399nqY3e6g1x` | All |
| `FONNTE_API_TOKEN` | `bd4wyhuNRsmvKHJa1uG8` | All |
| `FONNTE_DEVICE_ID` | `087883956811` | All |
| `WHATSAPP_ORDER_NUMBER` | `6282255905612` | All |

### Via Vercel CLI:

```bash
# Add all variables at once
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production
vercel env add RESEND_API_KEY production
vercel env add FONNTE_API_TOKEN production
vercel env add FONNTE_DEVICE_ID production
vercel env add WHATSAPP_ORDER_NUMBER production
```

---

## Step 4: Redeploy

After adding environment variables:

1. Go to: Deployments
2. Click: "..." → "Redeploy"
3. Or trigger new deployment by pushing to GitHub

---

## 🔑 Where to Get API Keys?

### 1. Supabase (Database)
- Go to: https://supabase.com/dashboard
- Select your project
- Settings → Database
- Copy "Connection string" (URI format)

### 2. Better Auth Secret
Generate secure secret:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### 3. Resend (Email)
- Go to: https://resend.com/api-keys
- Create API key
- Copy the key

### 4. Fonnte (WhatsApp)
- Go to: https://fonnte.com
- Login / Register
- Get API token from dashboard
- Get device ID from your connected device

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] DATABASE_URL is correct (test with Supabase)
- [ ] BETTER_AUTH_SECRET is strong (min 32 chars)
- [ ] **BETTER_AUTH_URL matches your custom domain: `balikin.masudrahmat.my.id`**
- [ ] **NEXT_PUBLIC_APP_URL matches your custom domain: `balikin.masudrahmat.my.id`**
- [ ] **NEXT_PUBLIC_BETTER_AUTH_URL matches your custom domain: `balikin.masudrahmat.my.id`**
- [ ] WhatsApp API tokens are valid
- [ ] PWA icons added to `/public/icons/`
- [ ] Build succeeds locally (`npm run build`)
- [ ] Git pushed to GitHub

---

## 🧪 Post-Deployment Testing

After deployment:

### 1. Basic Functionality
- [ ] Open production URL
- [ ] Check console for errors
- [ ] Test sign-in/sign-up
- [ ] Test dashboard access

### 2. PWA Features
- [ ] Check manifest.json: `https://balikin.masudrahmat.my.id/manifest.json`
- [ ] Check service worker: Browser DevTools → Application → Service Workers
- [ ] Test install prompt (Chrome Android)
- [ ] Test "Add to Home Screen" (Safari iOS)

### 3. Mobile Responsiveness
- [ ] Test on iPhone SE (375px)
- [ ] Test on Android (360px-412px)
- [ ] Test touch targets
- [ ] Test form inputs

### 4. API Integrations
- [ ] Test email OTP (Resend)
- [ ] Test WhatsApp alerts (Fonnte)
- [ ] Test database operations

---

## 🌐 Custom Domain (Optional)

To use custom domain:

1. Go to: Settings → Domains
2. Add your domain: `balikin.id`
3. Update DNS records (Vercel will provide instructions)
4. Update environment variables:
   ```
   NEXT_PUBLIC_APP_URL=https://balikin.id
   BETTER_AUTH_URL=https://balikin.id
   NEXT_PUBLIC_BETTER_AUTH_URL=https://balikin.id
   ```

---

## 📊 Monitor Deployment

- Deployment logs: Vercel Dashboard → Deployments
- Real-time logs: Vercel Dashboard → Logs
- Analytics: Vercel Dashboard → Analytics
- Error tracking: Check Logs for any runtime errors

---

## 🆘 Troubleshooting

### Build Fails
- Check: Environment variables are set correctly
- Check: No TypeScript errors (run `npm run build` locally)
- Check: All dependencies installed

### Auth Fails
- Check: BETTER_AUTH_SECRET is same in all environments
- Check: BETTER_AUTH_URL matches your domain
- Check: No trailing slashes in URLs

### Database Fails
- Check: DATABASE_URL is correct format
- Check: Supabase project is active
- Check: Connection pooling is enabled (if needed)

### WhatsApp Not Working
- Check: FONNTE_API_TOKEN is valid
- Check: FONNTE_DEVICE_ID is correct
- Check: Device is connected to Fonnte

---

## 📱 Current Status

| Item | Status |
|------|--------|
| Build | ✅ Success |
| Git Push | ✅ Completed |
| Mobile Responsive | ✅ 9/10 |
| PWA Implementation | ✅ Complete (icons pending) |
| Environment Variables | ✅ Ready to copy |

---

## 🎯 Next Steps

1. ✅ Copy environment variables from `.env.production`
2. ✅ Deploy to Vercel
3. ✅ Add environment variables in Vercel Dashboard
4. ✅ Redeploy to apply changes
5. ✅ Test all functionality
6. ⚠️ Generate and add PWA icons (see `public/README.md`)

---

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- PWA Guide: See `public/README.md`

Good luck! 🚀

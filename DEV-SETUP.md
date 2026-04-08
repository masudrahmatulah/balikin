# Development Setup Guide

## ⚠️ Important: DevTunnel Issues & Solutions

### Problem: 404 Errors on DevTunnel but Works on Localhost

When using Microsoft DevTunnel, you may encounter these issues:

1. **Routes return 404 on devtunnel but work on localhost**
2. **WebSocket HMR connection fails**
3. **CORS errors from Microsoft tunnel servers**

### Root Cause

DevTunnel creates a persistent connection to your dev server. If you:
- Start the tunnel, then start the dev server
- Add new API routes while the tunnel is running
- Restart the dev server without restarting the tunnel

The tunnel may serve **stale routes** from its cache.

### Solution: Proper Startup Sequence

**Always follow this order:**

```bash
# 1. Start Next.js dev server FIRST
npm run dev

# 2. Wait for "Ready" message
# You should see: "✓ Ready in X.Xs"

# 3. THEN start your devtunnel in a SEPARATE terminal
devtunnel host -p 3000 --allow-anonymous
```

### If You're Already Getting 404s

**Quick Fix (No Restart Needed):**

```bash
# In your dev server terminal, press Ctrl+C to stop
# Then restart:
npm run dev

# The tunnel should auto-reconnect
```

**Full Reset (If Still Getting 404s):**

```bash
# 1. Stop the dev server (Ctrl+C)
# 2. Stop the devtunnel (Ctrl+C in its terminal)
# 3. Clear Next.js cache
rm -rf .next

# 4. Start dev server
npm run dev

# 5. Wait for "Ready" message
# 6. THEN start tunnel again
devtunnel host -p 3000 --allow-anonymous
```

## 🔧 Current Application Status

### Fixed Issues:
✅ Service Worker no longer caches POST requests
✅ Database connection pooling optimized for Supabase
✅ Sign-out properly clears cookies
✅ Metadata warnings fixed (viewport & themeColor)
✅ Middleware simplified (no more Edge runtime errors)

### Known DevTunnel Limitations:
⚠️ WebSocket HMR (`wss://.../_next/webpack-hmr`) - **This is normal and expected**
   - HMR works better on localhost:3000 directly
   - Devtunnel doesn't fully support WebSocket upgrades
   - **Solution**: Use localhost for development, tunnel only for testing/sharing

⚠️ CORS warnings from `global.rel.tunnels.api.visualstudio.com`
   - External Microsoft infrastructure, not your app
   - Doesn't break functionality
   - Won't occur in production

## 🚀 Best Development Workflow

### Option 1: Local Development (Recommended)
```bash
npm run dev
# Open: http://localhost:3000
```
**Pros:** Fast HMR, no tunnel issues, instant feedback

### Option 2: DevTunnel for Testing/Sharing
```bash
# Terminal 1
npm run dev

# Terminal 2 (wait for "Ready" first!)
devtunnel host -p 3000 --allow-anonymous
```
**Pros:** Share with others, test on mobile
**Cons:** Slower HMR, some WebSocket warnings

## 📝 Testing the API Routes

All API routes should return 200 when properly started:

```bash
# Test OTP endpoint
curl -X POST http://localhost:3000/api/auth/email-otp/send-verification-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"sign-in"}'

# Expected: {"success":true,"message":"OTP sent successfully","otp":"123456"}
```

## 🐛 Troubleshooting

### "CONNECT_TIMEOUT" Database Error
- Check Supabase is running and accessible
- Verify DATABASE_URL in `.env.local`
- Free tier Supabase has connection limits

### "404 Not Found" on DevTunnel
1. Check route works on localhost first
2. Restart devtunnel
3. Clear `.next` folder
4. Ensure dev server was started BEFORE tunnel

### Service Worker Cache Issues
- Open DevTools → Application → Clear Storage
- Unregister service worker
- Hard refresh (Ctrl+Shift+R)

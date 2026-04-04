#!/bin/bash

# ==============================================
# VERCEL ENVIRONMENT VARIABLES SETUP SCRIPT
# ==============================================
# Cara penggunaan:
# 1. Install Vercel CLI: npm install -g vercel
# 2. Login: vercel login
# 3. Jalankan script ini: bash add-envs.sh
# ==============================================

echo "🚀 Adding environment variables to Vercel..."
echo ""

# Add all environment variables for production
echo "Adding DATABASE_URL..."
vercel env add DATABASE_URL production <<EOF
postgresql://postgres:Kandangan01***@db.piqyqhzxjayakiucfubu.supabase.co:5432/postgres
EOF

echo "Adding NEXT_PUBLIC_APP_URL..."
vercel env add NEXT_PUBLIC_APP_URL production <<EOF
https://balikin.vercel.app
EOF

echo "Adding NODE_ENV..."
vercel env add NODE_ENV production <<EOF
production
EOF

echo "Adding BETTER_AUTH_SECRET..."
vercel env add BETTER_AUTH_SECRET production <<EOF
ZJx+9Ro2u9TXPXHqryH7N9LkfFyJ7aJZlXkJ48UstGI=
EOF

echo "Adding BETTER_AUTH_URL..."
vercel env add BETTER_AUTH_URL production <<EOF
https://balikin.vercel.app
EOF

echo "Adding NEXT_PUBLIC_BETTER_AUTH_URL..."
vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production <<EOF
https://balikin.vercel.app
EOF

echo "Adding RESEND_API_KEY..."
vercel env add RESEND_API_KEY production <<EOF
re_re_aECFg5pX_47BJHpL22y22399nqY3e6g1x
EOF

echo "Adding FONNTE_API_TOKEN..."
vercel env add FONNTE_API_TOKEN production <<EOF
bd4wyhuNRsmvKHJa1uG8
EOF

echo "Adding FONNTE_DEVICE_ID..."
vercel env add FONNTE_DEVICE_ID production <<EOF
087883956811
EOF

echo "Adding FONNTE_BASE_URL..."
vercel env add FONNTE_BASE_URL production <<EOF
https://api.fonnte.com
EOF

echo "Adding FONNTE_PRIORITY_API_TOKEN..."
vercel env add FONNTE_PRIORITY_API_TOKEN production <<EOF
bd4wyhuNRsmvKHJa1uG8
EOF

echo "Adding FONNTE_PRIORITY_DEVICE_ID..."
vercel env add FONNTE_PRIORITY_DEVICE_ID production <<EOF
087883956811
EOF

echo "Adding FONNTE_PRIORITY_BASE_URL..."
vercel env add FONNTE_PRIORITY_BASE_URL production <<EOF
https://api.fonnte.com
EOF

echo "Adding WHATSAPP_ORDER_NUMBER..."
vercel env add WHATSAPP_ORDER_NUMBER production <<EOF
6282255905612
EOF

echo "Adding WHATSAPP_PROVIDER_STANDARD..."
vercel env add WHATSAPP_PROVIDER_STANDARD production <<EOF
fonnte_standard
EOF

echo "Adding WHATSAPP_PROVIDER_PRIORITY..."
vercel env add WHATSAPP_PROVIDER_PRIORITY production <<EOF
fonnte_priority
EOF

echo ""
echo "✅ All environment variables added!"
echo "🔄 Please redeploy your project in Vercel Dashboard"
echo ""
echo "⚠️  IMPORTANT: If your domain is not 'balikin.vercel.app',"
echo "   update these variables in Vercel Dashboard:"
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - BETTER_AUTH_URL"
echo "   - NEXT_PUBLIC_BETTER_AUTH_URL"

#!/bin/bash

# ============================================
# Test Email OTP Script
# ============================================
# Script ini untuk test pengiriman email OTP
# ============================================

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   📧  Balikin Email OTP Test Tool  📧  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Default URL
DEFAULT_URL="http://localhost:3000"
URL=${1:-$DEFAULT_URL}

echo -e "${YELLOW}📍 Server URL:${NC} $URL"
echo ""

# Minta email
read -p "✉️  Masukkan email untuk test: " EMAIL

if [ -z "$EMAIL" ]; then
  echo -e "${RED}❌ Email tidak boleh kosong!${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Mengirim OTP ke: $EMAIL${NC}"
echo ""

# Kirim request ke API
RESPONSE=$(curl -s -X POST "$URL/api/auth/email-otp/send-verification-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"type\": \"sign-in\"
  }")

echo -e "${GREEN}📬 Response:${NC}"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""

# Cek apakah sukses
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ OTP berhasil dikirim!${NC}"
  echo ""
  echo -e "${YELLOW}📧 Cek inbox email Anda:${NC}"
  echo "   1. Inbox utama"
  echo "   2. Folder Spam/Junk"
  echo "   3. Folder Promotions (Gmail)"
  echo ""
  
  # Extract OTP jika ada (development mode only)
  OTP=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('otp', ''))" 2>/dev/null)
  
  if [ ! -z "$OTP" ]; then
    echo -e "${GREEN}🔑 Kode OTP (Development Mode):${NC} $OTP"
    echo ""
    echo -e "${YELLOW}💡 Note:${NC} Di production, OTP tidak akan ditampilkan di response."
    echo "   Hanya dikirim via email untuk keamanan."
  fi
else
  echo -e "${RED}❌ Gagal mengirim OTP!${NC}"
  echo ""
  echo -e "${YELLOW}🔍 Kemungkinan penyebab:${NC}"
  echo "   1. Server belum running (npm run dev)"
  echo "   2. RESEND_API_KEY tidak valid"
  echo "   3. Email address tidak valid"
  echo "   4. Database connection error"
  echo ""
  echo -e "${YELLOW}💡 Solusi:${NC}"
  echo "   1. Pastikan server running: npm run dev"
  echo "   2. Cek logs di terminal untuk error detail"
  echo "   3. Verifikasi RESEND_API_KEY di Resend dashboard"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"

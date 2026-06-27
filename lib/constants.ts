export const FREE_TAG_LIMIT = 2;

// Harga produk sesuai strategi update_produk.md
export const PREMIUM_PRICE = 54000;       // Balikin Armor Tag
export const STICKER_PACK_PRICE = 59000;  // Semua varian stiker (Pro/Daily/Micro/Family)
export const STICKER_PACK_SIZE = 12;      // Default: Family (12 QR campuran)

export const STICKER_PAYMENT_METHOD = 'manual_qris';
export const STICKER_PAYMENT_LABEL = 'QRIS Manual';
export const STICKER_QRIS_NOTES = 'Scan QRIS lalu transfer sesuai nominal. Order akan diproses setelah verifikasi admin.';

export const WHATSAPP_ORDER_NUMBER = process.env.WHATSAPP_ORDER_NUMBER || '6281234567890';

export const UPGRADE_WHATSAPP_MESSAGE = `Halo, saya ingin pesan Balikin Armor Tag Premium. Mohon infonya.`;
export const STICKER_ORDER_WHATSAPP_MESSAGE = `Halo, saya ingin pesan Stiker Balikin Family (12 QR campuran).`;

// Ongkir flat cadangan jika API logistik timeout (checkout.md Section 4B)
export const SHIPPING_FALLBACK_KALSEL = 15000;
export const SHIPPING_FALLBACK_LUAR_KALSEL = 35000;
export const SHIPPING_API_TIMEOUT_MS = 4000;

// RajaOngkir Integration
export const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter';
export const RAJAONGKIR_ORIGIN_CITY_ID = process.env.RAJAONGKIR_ORIGIN_CITY_ID ?? '153'; // Hulu Sungai Selatan / Kandangan
export const STICKER_WEIGHT_GRAMS = 500; // Estimasi 1 pack stiker + packaging

// Midtrans QRIS Payment
export const MIDTRANS_ENV = process.env.MIDTRANS_ENV ?? 'sandbox';
export const MIDTRANS_BASE_URL = MIDTRANS_ENV === 'production'
  ? 'https://app.midtrans.com/api'
  : 'https://app.sandbox.midtrans.com/api';
export const NEXT_PUBLIC_MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY ?? '';
export const MIDTRANS_PAYMENT_TYPE = 'qris'; // QRIS payment method
export const MIDTRANS_SNAP_URL = MIDTRANS_ENV === 'production'
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

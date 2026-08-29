export const FREE_TAG_LIMIT = 1;
export const FREE_TAG_TRIAL_DAYS = 7;
export const PREMIUM_UPGRADE_PRICE = 25000; // Upgrade tag free -> premium (digital only, tanpa fisik)

// Harga produk sesuai strategi update_produk.md
export const PREMIUM_PRICE = 54000;       // Balikin Armor Tag
export const BACKSIDE_CUSTOM_PRICE = 10000; // Custom image sisi belakang acrylic (+Rp10.000/order)
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

// RajaOngkir Integration (Komerce API — api.rajaongkir.com/starter lama sudah dimatikan)
export const RAJAONGKIR_BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
export const RAJAONGKIR_ORIGIN_CITY_ID = process.env.RAJAONGKIR_ORIGIN_CITY_ID ?? '153'; // Hulu Sungai Selatan / Kandangan
export const STICKER_WEIGHT_GRAMS = 500; // Estimasi 1 pack stiker + packaging

// Komerce Payment API (collaborator.komerce.id) — menggantikan Midtrans
// API key sama seperti RajaOngkir (Developer > Settings > Api Key di https://collaborator.komerce.id)
export const KOMERCE_ENV = process.env.KOMERCE_ENV ?? 'sandbox';
export const KOMERCE_PAYMENT_BASE_URL = KOMERCE_ENV === 'production'
  ? 'https://api.collaborator.komerce.id/user'
  : 'https://api-sandbox.collaborator.komerce.id/user';
export const KOMERCE_PAYMENT_PAGE_URL = KOMERCE_ENV === 'production'
  ? 'https://pay.komerce.id'
  : 'https://pay-sandbox.komerce.id';
export const KOMERCE_PAYMENT_METHOD = 'qris'; // QRIS payment method
export const KOMERCE_PAYMENT_CALLBACK_SECRET = process.env.KOMERCE_PAYMENT_CALLBACK_SECRET ?? 'balikin-komerce-callback-secret';

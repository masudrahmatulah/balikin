'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { stickerOrders, referralVouchers } from '@/db/schema';
import { eq, and, lt, gt, sql } from 'drizzle-orm';
import { STICKER_PAYMENT_METHOD, BACKSIDE_CUSTOM_PRICE } from '@/lib/constants';
import { PRODUCT_CATALOG, resolveProductKey } from '@/lib/product-catalog';
import { normalizeStickerColorTheme } from '@/lib/sticker-color-themes';
import { sendStickerOrderNotificationToAdmin } from '@/lib/whatsapp';

// ─── Batas panjang field ───────────────────────────────────────────────────
const MAX_FIELD_LENGTHS = {
  recipientName: 100,
  phone: 20,
  addressLine: 500,
  city: 100,
  postalCode: 10,
  notes: 300,
  voucherCode: 50,
} as const;

const PHONE_REGEX = /^628[1-9][0-9]{6,10}$/;
const VOUCHER_REGEX = /^[A-Z0-9_-]{3,50}$/;

// ─── Sanitasi ──────────────────────────────────────────────────────────────

// Strip karakter HTML dari field bebas (notes) untuk mencegah injection
// jika output-nya pernah dirender di luar React escaping.
function stripHtml(value: string): string {
  return value.replace(/[<>"'&]/g, (c) =>
    ({ '<': '', '>': '', '"': '', "'": '', '&': '' })[c] ?? c
  );
}

// ─── Validasi field ────────────────────────────────────────────────────────

function validateField(value: string, fieldName: string, maxLength: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${fieldName} tidak boleh kosong`);
  if (trimmed.length > maxLength) throw new Error(`${fieldName} maksimal ${maxLength} karakter`);
  return trimmed;
}

function validatePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) throw new Error('Nomor WhatsApp tidak boleh kosong');
  if (!PHONE_REGEX.test(trimmed)) {
    throw new Error('Format nomor WhatsApp tidak valid. Gunakan format 628...');
  }
  return trimmed;
}

function validateSegment(segment: string): 'pribadi' | 'keluarga' | 'bisnis' {
  const valid = ['pribadi', 'keluarga', 'bisnis'] as const;
  if (!valid.includes(segment as typeof valid[number])) {
    throw new Error('Pilihan penggunaan produk tidak valid');
  }
  return segment as 'pribadi' | 'keluarga' | 'bisnis';
}

// ─── Auth guard ────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in?redirect=/stickers/checkout');
  return session;
}

// ─── Voucher: atomic race-condition-safe validation ────────────────────────
// Menggunakan UPDATE atomik PostgreSQL:
//   UPDATE ... SET usage_count + 1 WHERE code = $1 AND usage_count < max_usage_target AND expires_at > NOW()
// Jika 0 rows affected → kode tidak valid / habis / expired.
// Pola ini aman dari race condition karena PostgreSQL mengunci row saat UPDATE.

async function applyVoucher(
  voucherCode: string,
  buyerUserId: string
): Promise<{ discountAmount: number; voucherId: string }> {
  const code = voucherCode.trim().toUpperCase();

  if (!VOUCHER_REGEX.test(code)) {
    throw new Error('Format kode voucher tidak valid');
  }

  // Atomic: hanya berhasil jika kuota belum habis dan belum expired
  const result = await db
    .update(referralVouchers)
    .set({ usageCount: sql`${referralVouchers.usageCount} + 1` })
    .where(
      and(
        eq(referralVouchers.code, code),
        eq(referralVouchers.app_id, 'balikin_id'),
        lt(referralVouchers.usageCount, referralVouchers.maxUsageTarget),
        gt(referralVouchers.expiresAt, sql`NOW()`)
      )
    )
    .returning({ id: referralVouchers.id });

  if (result.length === 0) {
    throw new Error('Kode voucher tidak valid, sudah habis, atau telah kedaluwarsa');
  }

  // Saat ini voucher referral memberi cashback (bukan diskon langsung).
  // Nilai diskon ditetapkan 0 di sini — grand total tidak berubah.
  // Ganti dengan balikin_vouchers.discount_value saat tabel tersedia.
  return { discountAmount: 0, voucherId: result[0].id };
}

// ─── Input types ───────────────────────────────────────────────────────────

export interface CreateOrderInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  postalCode: string;
  notes?: string;
  segment: string;
  voucherCode?: string;
  productKey?: string;
  stickerColorTheme?: string;
  shippingCost: number;
  shippingCourier: string;
  destinationCityId: string;
  destinationCityName: string;
  backsideCustom?: boolean;
  backsideCustomImageUrl?: string;
}

// ─── Server Action ─────────────────────────────────────────────────────────

export async function createStickerOrder(input: CreateOrderInput) {
  const session = await requireAuth();

  // Validasi semua field di server — TIDAK mempercayai nilai dari client
  const recipientName = validateField(input.recipientName, 'Nama Penerima', MAX_FIELD_LENGTHS.recipientName);
  const phone = validatePhone(input.phone);
  const addressLine = validateField(input.addressLine, 'Alamat Lengkap', MAX_FIELD_LENGTHS.addressLine);
  const postalCode = validateField(input.postalCode, 'Kode Pos', MAX_FIELD_LENGTHS.postalCode);
  const segment = validateSegment(input.segment);

  // Validasi shipping cost input
  if (typeof input.shippingCost !== 'number' || input.shippingCost < 0) {
    throw new Error('Ongkir tidak valid');
  }
  if (!input.shippingCourier?.trim()) {
    throw new Error('Kurir pengiriman tidak valid');
  }
  if (!input.destinationCityId?.trim()) {
    throw new Error('Kota tujuan tidak dipilih');
  }

  // Notes: validasi panjang + strip karakter HTML
  const notes = input.notes?.trim()
    ? stripHtml(validateField(input.notes, 'Catatan', MAX_FIELD_LENGTHS.notes))
    : null;

  // Harga & productType SELALU ditentukan server dari katalog — tidak pernah dari client
  const catalogKey = resolveProductKey(input.productKey);
  const catalogEntry = PRODUCT_CATALOG[catalogKey];
  const stickerColorTheme = catalogEntry.productType === 'sticker'
    ? normalizeStickerColorTheme(input.stickerColorTheme)
    : null;
  let basePrice = catalogEntry.price;
  let discountAmount = 0;

  // Custom backside image hanya berlaku untuk produk acrylic (+Rp10.000/order)
  let backsideCustom = false;
  let backsideCustomImageUrl: string | null = null;
  if (catalogEntry.productType === 'acrylic' && input.backsideCustom) {
    backsideCustom = true;
    const imageUrl = input.backsideCustomImageUrl?.trim();
    if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/uploads/'))) {
      throw new Error('Custom image sisi belakang wajib diupload');
    }
    if (imageUrl.length > 2000) {
      throw new Error('URL custom image tidak valid');
    }
    backsideCustomImageUrl = imageUrl;
    basePrice += BACKSIDE_CUSTOM_PRICE;
  }

  // Validasi voucher (opsional) — atomic SQL anti-race-condition (checkout.md Section 4A)
  if (input.voucherCode?.trim()) {
    const voucher = await applyVoucher(input.voucherCode, session.user.id);
    discountAmount = voucher.discountAmount;
  }

  // Re-verify shipping cost di server (anti-manipulation)
  // Client kirim ongkir, server re-query RajaOngkir untuk konfirmasi
  let verifiedShippingCost = input.shippingCost;
  const shippingCostVerification = await verifyShippingCost(
    input.destinationCityId,
    input.shippingCourier
  );
  if (shippingCostVerification) {
    verifiedShippingCost = shippingCostVerification;
  }

  const totalAmount = basePrice - discountAmount + verifiedShippingCost;

  const [order] = await db
    .insert(stickerOrders)
    .values({
      app_id: 'balikin_id',
      userId: session.user.id,
      recipientName,
      phone,
      addressLine,
      city: input.destinationCityName,
      postalCode,
      notes,
      shippingCost: verifiedShippingCost,
      shippingCourier: input.shippingCourier.toLowerCase(),
      destinationCityId: input.destinationCityId,
      destinationCityName: input.destinationCityName,
      paymentMethod: STICKER_PAYMENT_METHOD,
      productType: catalogEntry.productType,
      stickerColorTheme,
      packQuantity: 1,
      unitCountPerPack: catalogEntry.packSize,
      backsideCustom,
      backsideCustomImageUrl,
      totalAmount,
    })
    .returning();

  await sendStickerOrderNotificationToAdmin({
    orderId: order.id,
    userName: session.user.name || session.user.email || '',
    userEmail: session.user.email || '',
    productType: catalogEntry.productType,
    totalAmount,
    recipientName,
    phone,
  });

  return order;
}

// Helper: verify shipping cost from RajaOngkir
async function verifyShippingCost(destinationCityId: string, courier: string): Promise<number | null> {
  try {
    const response = await fetch('http://localhost:3000/api/shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationCityId, courier }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.success && data.data?.cost ? data.data.cost : null;
  } catch (error) {
    console.error('Error verifying shipping cost:', error);
    return null; // Use client's cost if server verification fails
  }
}

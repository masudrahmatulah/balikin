'use server';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { stickerOrders, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { revalidateStickerOrdersCache } from './data-access';

const APP_ID = 'balikin_id';
const MAX_BULK_IDS = 200;

const ALLOWED_PRODUCT_TYPES = ['sticker', 'acrylic', 'bundle'] as const;
const BASE_PRICE_BY_PRODUCT_TYPE: Record<string, number> = {
  sticker: 59000,
  acrylic: 54000,
  bundle: 89000,
};
const ALLOWED_ORDER_STATUSES = ['pending_payment', 'in_production', 'shipped', 'completed'] as const;
const ALLOWED_PAYMENT_STATUSES = ['pending', 'paid'] as const;

type OrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];
type PaymentStatus = (typeof ALLOWED_PAYMENT_STATUSES)[number];

async function verifyAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-orders');
  }
  return session;
}

function validateField(value: unknown, label: string, maxLength = 255): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} wajib diisi`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`${label} maksimal ${maxLength} karakter`);
  }
  return trimmed;
}

function validateOptionalField(value: unknown, label: string, maxLength = 500): string | null {
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`${label} tidak valid`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`${label} maksimal ${maxLength} karakter`);
  }
  return trimmed;
}

function validatePhone(value: unknown): string {
  const phone = validateField(value, 'Nomor WhatsApp', 20);
  const normalized = phone.replace(/[\s-]/g, '');
  if (!/^(\+62|62|0)8\d{7,12}$/.test(normalized)) {
    throw new Error('Format nomor WhatsApp tidak valid (contoh: 08xxxxxxxxxx)');
  }
  return normalized;
}

function validatePostalCode(value: unknown): string {
  const postal = validateField(value, 'Kode Pos', 10);
  if (!/^\d{4,6}$/.test(postal)) {
    throw new Error('Kode Pos harus 4-6 digit angka');
  }
  return postal;
}

function validateInt(value: unknown, label: string, min: number, max: number): number {
  const num = typeof value === 'string' ? Number(value) : value;
  if (typeof num !== 'number' || !Number.isFinite(num) || !Number.isInteger(num)) {
    throw new Error(`${label} harus berupa angka bulat`);
  }
  if (num < min || num > max) {
    throw new Error(`${label} harus antara ${min.toLocaleString('id-ID')} dan ${max.toLocaleString('id-ID')}`);
  }
  return num;
}

function normalizeOrderIds(orderIds: unknown): string[] {
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    throw new Error('Tidak ada order yang dipilih');
  }
  if (orderIds.length > MAX_BULK_IDS) {
    throw new Error(`Maksimal ${MAX_BULK_IDS} order per aksi massal`);
  }
  const ids = orderIds.map((id) => String(id).trim()).filter(Boolean);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (ids.some((id) => !uuidRegex.test(id))) {
    throw new Error('ID order tidak valid');
  }
  return ids;
}

// ─── Verify & status transitions (existing) ──────────────────────────────

export async function verifyStickerOrder(orderId: string) {
  const session = await verifyAdminSession();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  if (order.paymentStatus === 'paid') {
    throw new Error('Order sudah diverifikasi');
  }

  await db
    .update(stickerOrders)
    .set({ paymentStatus: 'paid', verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(stickerOrders.id, orderId));

  await revalidateStickerOrdersCache();
}

export async function updateStickerOrderStatus(
  orderId: string,
  status: 'in_production' | 'shipped' | 'completed'
) {
  await verifyAdminSession();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  await db
    .update(stickerOrders)
    .set({ status })
    .where(eq(stickerOrders.id, orderId));

  await revalidateStickerOrdersCache();
}

// ─── Create (manual order oleh admin) ─────────────────────────────────────

export interface AdminCreateOrderInput {
  userEmail: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
  productType: string;
  packQuantity: number;
  unitCountPerPack: number;
  shippingCost: number;
}

export async function createStickerOrderByAdmin(input: AdminCreateOrderInput) {
  await verifyAdminSession();

  const email = validateField(input.userEmail, 'Email User', 255).toLowerCase();
  const buyer = await db.query.user.findFirst({
    where: eq(user.email, email),
    columns: { id: true },
  });
  if (!buyer) {
    throw new Error(`User dengan email "${email}" tidak ditemukan`);
  }

  const productType = String(input.productType ?? '').trim() as (typeof ALLOWED_PRODUCT_TYPES)[number];
  if (!ALLOWED_PRODUCT_TYPES.includes(productType)) {
    throw new Error('Tipe produk tidak valid');
  }

  const packQuantity = validateInt(input.packQuantity ?? 1, 'Jumlah pack', 1, 100);
  const unitCountPerPack = validateInt(input.unitCountPerPack ?? 6, 'Isi per pack', 1, 1000);
  const shippingCost = validateInt(input.shippingCost ?? 0, 'Ongkir', 0, 10_000_000);

  const basePrice = BASE_PRICE_BY_PRODUCT_TYPE[productType];
  const totalAmount = basePrice * packQuantity + shippingCost;

  await db.insert(stickerOrders).values({
    app_id: APP_ID,
    userId: buyer.id,
    status: 'pending_payment',
    paymentStatus: 'pending',
    paymentMethod: 'manual_qris',
    productType,
    recipientName: validateField(input.recipientName, 'Nama Penerima'),
    phone: validatePhone(input.phone),
    addressLine: validateField(input.addressLine, 'Alamat Lengkap', 500),
    city: validateField(input.city, 'Kota'),
    postalCode: validatePostalCode(input.postalCode),
    notes: validateOptionalField(input.notes, 'Catatan'),
    packQuantity,
    unitCountPerPack,
    shippingCost,
    shippingCourier: null,
    destinationCityId: null,
    destinationCityName: validateField(input.city, 'Kota Tujuan'),
    totalAmount,
  });

  await revalidateStickerOrdersCache();
}

// ─── Read (detail untuk dialog edit) ─────────────────────────────────────

export async function getStickerOrderForAdmin(orderId: string) {
  await verifyAdminSession();

  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ),
    columns: {
      recipientName: true,
      phone: true,
      addressLine: true,
      city: true,
      postalCode: true,
      notes: true,
      shippingCourier: true,
      shippingCost: true,
      totalAmount: true,
      paymentStatus: true,
      status: true,
    },
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  return order;
}

// ─── Update (edit detail order) ───────────────────────────────────────────

export interface AdminUpdateOrderInput {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
  shippingCourier?: string;
  shippingCost: number;
  totalAmount: number;
}

export async function updateStickerOrderByAdmin(input: AdminUpdateOrderInput) {
  await verifyAdminSession();

  const orderId = String(input.id ?? '').trim();
  const order = await db.query.stickerOrders.findFirst({
    where: and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ),
  });
  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  const shippingCourier = validateOptionalField(input.shippingCourier, 'Kurir', 50);

  await db
    .update(stickerOrders)
    .set({
      recipientName: validateField(input.recipientName, 'Nama Penerima'),
      phone: validatePhone(input.phone),
      addressLine: validateField(input.addressLine, 'Alamat Lengkap', 500),
      city: validateField(input.city, 'Kota'),
      postalCode: validatePostalCode(input.postalCode),
      notes: validateOptionalField(input.notes, 'Catatan'),
      shippingCourier: shippingCourier ? shippingCourier.toLowerCase() : null,
      shippingCost: validateInt(input.shippingCost, 'Ongkir', 0, 10_000_000),
      totalAmount: validateInt(input.totalAmount, 'Total Harga', 0, 100_000_000),
      updatedAt: new Date(),
    })
    .where(eq(stickerOrders.id, orderId));

  await revalidateStickerOrdersCache();
}

// ─── Delete (satu order) ─────────────────────────────────────────────────

export async function deleteStickerOrderById(orderId: string) {
  await verifyAdminSession();

  const deleted = await db
    .delete(stickerOrders)
    .where(and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID)
    ))
    .returning({ id: stickerOrders.id });

  if (deleted.length === 0) {
    throw new Error('Order tidak ditemukan');
  }

  await revalidateStickerOrdersCache();
}

// ─── Bulk actions ────────────────────────────────────────────────────────

export async function bulkSetPaymentStatus(orderIds: string[], paymentStatus: string) {
  await verifyAdminSession();
  const ids = normalizeOrderIds(orderIds);

  const status = String(paymentStatus).trim() as PaymentStatus;
  if (!ALLOWED_PAYMENT_STATUSES.includes(status)) {
    throw new Error('Status pembayaran tidak valid');
  }

  await db
    .update(stickerOrders)
    .set({
      paymentStatus: status,
      ...(status === 'paid' ? { verifiedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(and(
      inArray(stickerOrders.id, ids),
      eq(stickerOrders.app_id, APP_ID)
    ));

  await revalidateStickerOrdersCache();
}

export async function bulkSetOrderStatus(orderIds: string[], status: string) {
  await verifyAdminSession();
  const ids = normalizeOrderIds(orderIds);

  const nextStatus = String(status).trim() as OrderStatus;
  if (!ALLOWED_ORDER_STATUSES.includes(nextStatus)) {
    throw new Error('Status order tidak valid');
  }

  await db
    .update(stickerOrders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(
      inArray(stickerOrders.id, ids),
      eq(stickerOrders.app_id, APP_ID)
    ));

  await revalidateStickerOrdersCache();
}

export async function bulkDeleteStickerOrders(orderIds: string[]) {
  await verifyAdminSession();
  const ids = normalizeOrderIds(orderIds);

  await db
    .delete(stickerOrders)
    .where(and(
      inArray(stickerOrders.id, ids),
      eq(stickerOrders.app_id, APP_ID)
    ));

  await revalidateStickerOrdersCache();
}

'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_METHOD,
} from '@/lib/constants';
import { getAdminSessionForAction } from '@/lib/admin';
import { hasPermission } from '@/lib/admin-divisions';
import type { StickerShape, StickerSize } from '@/lib/sticker-template';

// ============================================================================
// CONSTANTS
// ============================================================================

const ORDER_ID_REGEX = /^[a-zA-Z0-9_-]{15,50}$/;
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const MAX_FIELD_LENGTH = {
  recipientName: 100,
  phone: 20,
  addressLine: 200,
  city: 100,
  postalCode: 10,
  notes: 500,
} as const;

const DEFAULT_TAG_CONFIG = {
  customMessage: 'Scan saya jika menemukan barang ini.',
  status: 'normal' as const,
  tier: 'premium' as const,
  productType: 'sticker' as const,
  isVerified: true,
  emailAlertsEnabled: false,
  whatsappAlertsEnabled: true,
} as const;
const APP_ID = 'balikin_id';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateStickerOrderInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateOrderId(orderId: string): boolean {
  return ORDER_ID_REGEX.test(orderId);
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15 && PHONE_REGEX.test(phone);
}

function sanitizeAndValidate(input: string, maxLength: number): string {
  const trimmed = input.trim();
  if (trimmed.length > maxLength) {
    throw new Error(`Field exceeds maximum length of ${maxLength} characters`);
  }
  return trimmed;
}

// ============================================================================
// SESSION HELPERS
// ============================================================================

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  return session;
}

async function requireStickerOrderPermission(permission: 'payment_verification' | 'sticker_orders') {
  const session = await getAdminSessionForAction();
  if (!session || !hasPermission(session.user.division, permission)) {
    throw new Error('Unauthorized');
  }
  return session;
}

// ============================================================================
// ORDER ACTIONS
// ============================================================================

export async function createStickerOrder(input: CreateStickerOrderInput) {
  const session = await requireSession();

  const recipientName = sanitizeAndValidate(input.recipientName, MAX_FIELD_LENGTH.recipientName);
  const phone = sanitizeAndValidate(input.phone, MAX_FIELD_LENGTH.phone);
  const addressLine = sanitizeAndValidate(input.addressLine, MAX_FIELD_LENGTH.addressLine);
  const city = sanitizeAndValidate(input.city, MAX_FIELD_LENGTH.city);
  const postalCode = sanitizeAndValidate(input.postalCode, MAX_FIELD_LENGTH.postalCode);
  const notes = input.notes ? sanitizeAndValidate(input.notes, MAX_FIELD_LENGTH.notes) : null;

  if (!validatePhone(phone)) {
    throw new Error('Nomor telepon tidak valid');
  }

  const [order] = await db.insert(stickerOrders).values({
    app_id: APP_ID,
    userId: session.user.id,
    recipientName,
    phone,
    addressLine,
    city,
    postalCode,
    notes,
    paymentMethod: STICKER_PAYMENT_METHOD,
    productType: 'sticker',
    packQuantity: 1,
    unitCountPerPack: STICKER_PACK_SIZE,
    totalAmount: STICKER_PACK_PRICE,
  }).returning();


  return order;
}

export async function getUserStickerOrders(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || session.user.id !== userId) {
    return [];
  }

  if (!userId || userId.length < 10 || userId.length > 50) {
    return [];
  }

  return db.query.stickerOrders.findMany({
    where: and(
      eq(stickerOrders.userId, userId),
      eq(stickerOrders.app_id, APP_ID)
    ),
    orderBy: [desc(stickerOrders.createdAt)],
    columns: {
      id: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      verifiedAt: true,
    },
    with: {
      bundles: {
        columns: {
          id: true,
          itemCount: true,
          status: true,
        },
        with: {
          tags: {
            columns: {
              id: true,
              slug: true,
              name: true,
              status: true,
            },
            where: (tags, { eq }) => eq(tags.app_id, APP_ID),
          },
        },
        where: (bundles, { eq }) => eq(bundles.app_id, APP_ID),
      },
    },
  });
}

export async function verifyStickerOrder(orderId: string) {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  await requireStickerOrderPermission('payment_verification');

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(stickerOrders)
      .where(and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID)))
      .for('update');
    if (!order) throw new Error('Order tidak ditemukan');
    if (order.paymentStatus !== 'pending') throw new Error('Order sudah diproses');
    if (!order.paymentProofUrl) throw new Error('Bukti pembayaran wajib diunggah sebelum verifikasi');

    const updated = await tx.update(stickerOrders)
      .set({ paymentStatus: 'paid', status: 'paid', verifiedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID), eq(stickerOrders.paymentStatus, 'pending')))
      .returning({ id: stickerOrders.id });
    if (updated.length === 0) throw new Error('Order sudah diproses');
  });
}

export async function updateStickerOrderStatus(orderId: string, status: 'in_production' | 'shipped' | 'completed') {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  await requireStickerOrderPermission('sticker_orders');

  const updated = await db.update(stickerOrders)
    .set({ status, updatedAt: new Date() })
    .where(and(
      eq(stickerOrders.id, orderId),
      eq(stickerOrders.app_id, APP_ID),
      eq(stickerOrders.paymentStatus, 'paid'),
    ))
    .returning({ id: stickerOrders.id });
  if (updated.length === 0) {
    const order = await db.query.stickerOrders.findFirst({
      where: and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID)),
      columns: { id: true },
    });
    if (!order) throw new Error('Order tidak ditemukan');
    throw new Error('Order belum diverifikasi pembayarannya');
  }

}

// ============================================================================
// BUNDLE GENERATION
// ============================================================================

export async function generateStickerBundle(
  orderId: string,
  stickerShape: StickerShape = 'circle',
  stickerSize: StickerSize = 'medium'
) {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  await requireStickerOrderPermission('sticker_orders');

  const bundle = await db.transaction(async (tx) => {
    const [order] = await tx
      .select({
        id: stickerOrders.id,
        userId: stickerOrders.userId,
        paymentStatus: stickerOrders.paymentStatus,
        phone: stickerOrders.phone,
      })
      .from(stickerOrders)
      .where(and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, APP_ID)))
      .for('update');

    if (!order) {
      throw new Error('Order tidak ditemukan');
    }

    if (order.paymentStatus !== 'paid') {
      throw new Error('Order belum diverifikasi pembayarannya');
    }

    const [existingBundle] = await tx
      .select({ id: tagBundles.id })
      .from(tagBundles)
      .where(and(eq(tagBundles.orderId, order.id), eq(tagBundles.app_id, APP_ID)))
      .limit(1);

    if (existingBundle) {
      throw new Error('Bundle sticker sudah pernah dibuat untuk order ini');
    }

    const [newBundle] = await tx.insert(tagBundles).values({
      app_id: APP_ID,
      orderId: order.id,
      productType: 'sticker',
      itemCount: STICKER_PACK_SIZE,
      status: 'ready_for_fulfillment',
      stickerShape,
      stickerSize,
    }).returning();

    const packTags = Array.from({ length: STICKER_PACK_SIZE }, (_, index) => ({
      app_id: APP_ID,
      slug: nanoid(12),
      bundleId: newBundle.id,
      ownerId: order.userId,
      name: `Sticker Pack #${index + 1}`,
      contactWhatsapp: order.phone,
      ...DEFAULT_TAG_CONFIG,
    }));

    await tx.insert(tags).values(packTags);

    await tx.update(stickerOrders)
      .set({
        status: 'in_production',
        updatedAt: new Date(),
      })
      .where(and(eq(stickerOrders.id, order.id), eq(stickerOrders.app_id, APP_ID)));

    return newBundle;
  });

  return bundle;
}

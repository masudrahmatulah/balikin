'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_METHOD,
} from '@/lib/constants';
import { isAdmin } from '@/lib/admin';

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
  if (!userId || userId.length < 10 || userId.length > 50) {
    return [];
  }

  return db.query.stickerOrders.findMany({
    where: eq(stickerOrders.userId, userId),
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
          },
        },
      },
    },
  });
}

export async function verifyStickerOrder(orderId: string) {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  await db.update(stickerOrders)
    .set({
      paymentStatus: 'paid',
      status: 'paid',
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(stickerOrders.id, orderId));

}

export async function updateStickerOrderStatus(orderId: string, status: 'in_production' | 'shipped' | 'completed') {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  await db.update(stickerOrders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(stickerOrders.id, orderId));

}

// ============================================================================
// BUNDLE GENERATION
// ============================================================================

export async function generateStickerBundle(
  orderId: string,
  stickerShape: import('@/lib/sticker-template').StickerShape = 'circle',
  stickerSize: import('@/lib/sticker-template').StickerSize = 'medium'
) {
  if (!validateOrderId(orderId)) {
    throw new Error('Invalid order ID');
  }

  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, orderId),
    columns: {
      id: true,
      userId: true,
      paymentStatus: true,
      phone: true,
      status: true,
    },
    with: {
      bundles: {
        columns: {
          id: true,
          itemCount: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order tidak ditemukan');
  }

  if (order.paymentStatus !== 'paid') {
    throw new Error('Order belum diverifikasi pembayarannya');
  }

  if (order.bundles.length > 0) {
    throw new Error('Bundle sticker sudah pernah dibuat untuk order ini');
  }

  const [bundle] = await db.insert(tagBundles).values({
    orderId: order.id,
    productType: 'sticker',
    itemCount: STICKER_PACK_SIZE,
    status: 'ready_for_fulfillment',
    stickerShape,
    stickerSize,
  }).returning();

  const packTags = Array.from({ length: STICKER_PACK_SIZE }, (_, index) => ({
    slug: nanoid(12),
    bundleId: bundle.id,
    ownerId: order.userId,
    name: `Sticker Pack #${index + 1}`,
    contactWhatsapp: order.phone,
    ...DEFAULT_TAG_CONFIG,
  }));

  await db.insert(tags).values(packTags);

  await db.update(stickerOrders)
    .set({
      status: 'in_production',
      updatedAt: new Date(),
    })
    .where(eq(stickerOrders.id, order.id));


  return bundle;
}
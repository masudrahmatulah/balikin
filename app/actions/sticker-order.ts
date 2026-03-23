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

interface CreateStickerOrderInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
}

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  return session;
}

export async function createStickerOrder(input: CreateStickerOrderInput) {
  const session = await requireSession();

  const recipientName = input.recipientName.trim();
  const phone = input.phone.trim();
  const addressLine = input.addressLine.trim();
  const city = input.city.trim();
  const postalCode = input.postalCode.trim();
  const notes = input.notes?.trim();

  if (!recipientName || !phone || !addressLine || !city || !postalCode) {
    throw new Error('Data pengiriman belum lengkap');
  }

  const [order] = await db.insert(stickerOrders).values({
    userId: session.user.id,
    recipientName,
    phone,
    addressLine,
    city,
    postalCode,
    notes: notes || null,
    paymentMethod: STICKER_PAYMENT_METHOD,
    productType: 'sticker',
    packQuantity: 1,
    unitCountPerPack: STICKER_PACK_SIZE,
    totalAmount: STICKER_PACK_PRICE,
  }).returning();

  return order;
}

export async function getUserStickerOrders(userId: string) {
  return db.query.stickerOrders.findMany({
    where: eq(stickerOrders.userId, userId),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      bundles: {
        with: {
          tags: true,
        },
      },
    },
  });
}

export async function verifyStickerOrder(orderId: string) {
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

export async function generateStickerBundle(orderId: string) {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, orderId),
    with: {
      bundles: {
        with: {
          tags: true,
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
  }).returning();

  const packTags = Array.from({ length: STICKER_PACK_SIZE }).map((_, index) => ({
    slug: nanoid(12),
    bundleId: bundle.id,
    ownerId: null,
    name: `Sticker Pack #${index + 1}`,
    contactWhatsapp: order.phone,
    customMessage: 'Scan saya jika menemukan barang ini.',
    rewardNote: null,
    status: 'normal' as const,
    tier: 'premium' as const,
    productType: 'sticker' as const,
    isVerified: true,
    emailAlertsEnabled: false,
    whatsappAlertsEnabled: true,
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

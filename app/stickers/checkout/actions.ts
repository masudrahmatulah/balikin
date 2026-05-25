'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_METHOD,
} from '@/lib/constants';

const MAX_FIELD_LENGTHS = {
  recipientName: 100,
  phone: 20,
  addressLine: 500,
  city: 100,
  postalCode: 10,
  notes: 300,
} as const;

const PHONE_REGEX = /^628[1-9][0-9]{6,10}$/;

function validateField(value: string, fieldName: string, maxLength: number): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} tidak boleh kosong`);
  }
  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} maksimal ${maxLength} karakter`);
  }
  return trimmed;
}

function validatePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) {
    throw new Error('Nomor WhatsApp tidak boleh kosong');
  }
  if (!PHONE_REGEX.test(trimmed)) {
    throw new Error('Format nomor WhatsApp tidak valid. Gunakan format 628...');
  }
  if (trimmed.length > MAX_FIELD_LENGTHS.phone) {
    throw new Error(`Nomor WhatsApp maksimal ${MAX_FIELD_LENGTHS.phone} karakter`);
  }
  return trimmed;
}

async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in?redirect=/stickers/checkout');
  }

  return session;
}

export interface CreateOrderInput {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export async function createStickerOrder(input: CreateOrderInput) {
  const session = await requireAuth();

  const recipientName = validateField(
    input.recipientName,
    'Nama Penerima',
    MAX_FIELD_LENGTHS.recipientName
  );
  const phone = validatePhone(input.phone);
  const addressLine = validateField(
    input.addressLine,
    'Alamat Lengkap',
    MAX_FIELD_LENGTHS.addressLine
  );
  const city = validateField(input.city, 'Kota', MAX_FIELD_LENGTHS.city);
  const postalCode = validateField(
    input.postalCode,
    'Kode Pos',
    MAX_FIELD_LENGTHS.postalCode
  );
  const notes = input.notes
    ? validateField(input.notes, 'Catatan Tambahan', MAX_FIELD_LENGTHS.notes)
    : null;

  const [order] = await db
    .insert(stickerOrders)
    .values({
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
    })
    .returning();

  return order;
}
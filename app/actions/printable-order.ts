'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import {
  PRINTABLE_FIVE_PRICE,
  PRINTABLE_SINGLE_PRICE,
  PRINTABLE_TEN_PRICE,
  PRINTABLE_PAYMENT_METHOD,
} from '@/lib/constants';

const PACKAGES = {
  single: { quantity: 1, price: PRINTABLE_SINGLE_PRICE, label: 'Printable Single' },
  five: { quantity: 5, price: PRINTABLE_FIVE_PRICE, label: 'Printable 5 Tag' },
  ten: { quantity: 10, price: PRINTABLE_TEN_PRICE, label: 'Printable 10 Tag' },
} as const;

export type PrintablePackage = keyof typeof PACKAGES;

export async function createPrintableOrder(input: {
  packageKey: PrintablePackage;
  recipientName: string;
  phone: string;
  logoUrl?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in');

  const pack = PACKAGES[input.packageKey];
  if (!pack) throw new Error('Paket printable tidak valid');

  const recipientName = input.recipientName.trim().slice(0, 100);
  const phone = input.phone.trim().slice(0, 20);
  if (!recipientName || !phone) throw new Error('Nama dan WhatsApp wajib diisi');
  if (input.logoUrl && !input.logoUrl.startsWith('https://')) {
    throw new Error('Logo tidak valid');
  }

  const [order] = await db.insert(stickerOrders).values({
    userId: session.user.id,
    productType: 'printable',
    recipientName,
    phone,
    addressLine: 'Digital delivery',
    city: 'Indonesia',
    postalCode: '00000',
    notes: JSON.stringify({ packageKey: input.packageKey, label: pack.label, logoUrl: input.logoUrl || null }),
    paymentMethod: PRINTABLE_PAYMENT_METHOD,
    packQuantity: 1,
    unitCountPerPack: pack.quantity,
    totalAmount: pack.price,
  }).returning({ id: stickerOrders.id });

  return { orderId: order.id };
}

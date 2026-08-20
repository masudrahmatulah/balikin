'use server';

import { cache } from 'react';
import { db } from '@/db';
import { stickerOrders, tagUpgradeOrders } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';

const APP_ID = 'balikin_id';
const LIMIT = 100;

export type PaymentStatus = 'pending' | 'paid' | 'failed';

async function getUpgradePaymentsCore(status?: PaymentStatus) {
  return db.query.tagUpgradeOrders.findMany({
    where: and(
      eq(tagUpgradeOrders.app_id, APP_ID),
      status ? eq(tagUpgradeOrders.paymentStatus, status) : undefined
    ),
    orderBy: [desc(tagUpgradeOrders.createdAt)],
    with: {
      tag: {
        columns: { id: true, slug: true, name: true, tier: true },
      },
      user: {
        columns: { id: true, email: true, name: true },
      },
    },
    limit: LIMIT,
  });
}

export const getUpgradePayments = cache(getUpgradePaymentsCore);

async function getStickerPaymentOrdersCore(status?: PaymentStatus) {
  return db.query.stickerOrders.findMany({
    where: and(
      eq(stickerOrders.app_id, APP_ID),
      status ? eq(stickerOrders.paymentStatus, status) : undefined
    ),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: {
        columns: { id: true, email: true, name: true },
      },
    },
    limit: LIMIT,
  });
}

export const getStickerPaymentOrders = cache(getStickerPaymentOrdersCore);
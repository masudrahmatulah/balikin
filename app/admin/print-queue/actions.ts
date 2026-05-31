'use server';

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { printQueue } from '@/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';
import { revalidatePrintQueueCache } from './data-access';

const APP_ID = 'balikin_id';
const VALID_STATUSES = ['pending', 'printing', 'quality_check', 'ready_for_stock', 'completed'] as const;

async function verifyAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/print-queue');
  }
  return session;
}

export async function updatePrintQueueStatus(
  itemId: string,
  newStatus: string,
  adminId: string
) {
  const session = await verifyAdminSession();

  if (!VALID_STATUSES.includes(newStatus as any)) {
    throw new Error('Status tidak valid');
  }

  const currentItem = await db.query.printQueue.findFirst({
    where: and(
      eq(printQueue.id, itemId),
      eq(printQueue.app_id, APP_ID)
    ),
  });

  if (!currentItem) {
    throw new Error('Item tidak ditemukan');
  }

  const updateData: any = { status: newStatus };

  if (newStatus === 'printing' && !currentItem.printedAt) {
    updateData.printedAt = new Date();
    updateData.printedBy = adminId;
  }

  if (newStatus === 'completed' && !currentItem.completedAt) {
    updateData.completedAt = new Date();
  }

  await db
    .update(printQueue)
    .set(updateData)
    .where(eq(printQueue.id, itemId));

  const { ip, userAgent } = await getRequestContext();
  await logAuditAction({
    adminId,
    action: 'update_print_queue_status',
    entityType: 'print_queue',
    entityId: itemId,
    originalValue: { status: currentItem.status },
    newValue: { status: newStatus },
    ipAddress: ip,
    userAgent,
  });

  await revalidatePrintQueueCache();
}

export async function bulkUpdatePrintQueueStatus(
  ids: string[],
  newStatus: string,
  adminId: string
) {
  const session = await verifyAdminSession();

  if (!VALID_STATUSES.includes(newStatus as any)) {
    throw new Error('Status tidak valid');
  }

  const currentItems = await db.query.printQueue.findMany({
    where: and(
      inArray(printQueue.id, ids),
      eq(printQueue.app_id, APP_ID)
    ),
  });

  if (currentItems.length === 0) {
    throw new Error('Tidak ada item yang ditemukan');
  }

  const updates = currentItems.map(item => {
    const updateData: any = { status: newStatus };

    if (newStatus === 'printing' && !item.printedAt) {
      updateData.printedAt = new Date();
      updateData.printedBy = adminId;
    }

    if (newStatus === 'completed' && !item.completedAt) {
      updateData.completedAt = new Date();
    }

    return { id: item.id, updateData };
  });

  await Promise.all(
    updates.map(({ id, updateData }) =>
      db
        .update(printQueue)
        .set(updateData)
        .where(eq(printQueue.id, id))
    )
  );

  const { ip, userAgent } = await getRequestContext();
  await Promise.all(
    currentItems.map(item =>
      logAuditAction({
        adminId,
        action: 'bulk_update_print_queue_status',
        entityType: 'print_queue',
        entityId: item.id,
        originalValue: { status: item.status },
        newValue: { status: newStatus },
        ipAddress: ip,
        userAgent,
      })
    )
  );

  await revalidatePrintQueueCache();
}
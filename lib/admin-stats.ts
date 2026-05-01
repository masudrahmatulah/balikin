import { db } from '@/db';
import { stickerOrders, modulePurchaseOrders } from '@/db/schema';
import { eq, count, or } from 'drizzle-orm';

/**
 * Get pending orders count for admin header badge
 * Includes both sticker orders and module purchase orders
 */
export async function getPendingOrdersCount() {
  // Get pending sticker orders count
  const pendingStickerOrdersResult = await db
    .select({ count: count() })
    .from(stickerOrders)
    .where(
      or(
        eq(stickerOrders.status, 'pending_payment'),
        eq(stickerOrders.paymentStatus, 'pending')
      )
    );
  const pendingStickerOrdersCount = pendingStickerOrdersResult[0]?.count || 0;

  // Get pending module purchase orders count (paid modules)
  const pendingModuleOrdersResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(
      or(
        eq(modulePurchaseOrders.status, 'pending_payment'),
        eq(modulePurchaseOrders.status, 'paid')
      )
    );
  const pendingModuleOrdersCount = pendingModuleOrdersResult[0]?.count || 0;

  // Total pending orders (sticker + module)
  return pendingStickerOrdersCount + pendingModuleOrdersCount;
}

/**
 * Get pending module requests count (free modules)
 */
export async function getPendingRequestsCount() {
  const { moduleRequests } = await import('@/db/schema');
  const { eq, count } = await import('drizzle-orm');

  const pendingRequestsResult = await db
    .select({ count: count() })
    .from(moduleRequests)
    .where(eq(moduleRequests.status, 'pending'));

  return pendingRequestsResult[0]?.count || 0;
}

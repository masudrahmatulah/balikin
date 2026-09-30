'use server';

import { db } from '@/db';
import { modulePurchaseOrders, userModulePermissions, moduleUsageAnalytics, user, moduleConfig } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { ModuleType } from '@/lib/admin-modules';
import {
  sendModulePurchaseNotificationToAdmin,
  sendModulePaymentVerifiedNotificationToUser,
  sendModuleApprovedNotificationToUser,
  sendModuleRejectedNotificationToUser,
} from '@/lib/whatsapp';

const APP_ID = 'balikin_id';

/**
 * Helper function to get authenticated session
 */
async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * User: Create a purchase order for a module
 */
export async function createModulePurchaseOrder(moduleType: ModuleType) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if module exists and is enabled
  const moduleConfigData = await db.query.moduleConfig.findFirst({
    where: and(eq(moduleConfig.moduleType, moduleType), eq(moduleConfig.app_id, APP_ID)),
  });

  if (!moduleConfigData) {
    throw new Error('Module not found');
  }

  if (!moduleConfigData.isEnabled) {
    throw new Error('Module is currently not available');
  }

  // Check if user already has this module enabled
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.moduleType, moduleType),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  if (existingPermission?.isEnabled) {
    throw new Error('You already have access to this module');
  }

  const { order, created } = await db.transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.id, userId), eq(user.app_id, APP_ID)))
      .for('update');

    const [pendingOrder] = await tx
      .select()
      .from(modulePurchaseOrders)
      .where(and(
        eq(modulePurchaseOrders.userId, userId),
        eq(modulePurchaseOrders.moduleType, moduleType),
        eq(modulePurchaseOrders.status, 'pending_payment'),
        eq(modulePurchaseOrders.app_id, APP_ID)
      ))
      .limit(1);

    if (pendingOrder) {
      return { order: pendingOrder, created: false };
    }

    const [newOrder] = await tx.insert(modulePurchaseOrders).values({
      app_id: APP_ID,
      userId,
      moduleType,
      status: 'pending_payment',
      amount: moduleConfigData.price,
      paymentMethod: 'manual_qris',
    }).returning();

    return { order: newOrder, created: true };
  });

  if (!created) {
    return { success: true, order };
  }

  // Send WhatsApp notification to admin
  try {
    await sendModulePurchaseNotificationToAdmin({
       orderId: order.id,
      userName: session.user.name || 'Pengguna',
      userEmail: session.user.email,
      moduleType,
      amount: moduleConfigData.price,
    });
  } catch (error) {
    console.error('[Module Purchase] Failed to send WhatsApp notification:', error);
    // Continue even if WhatsApp fails
  }

  revalidatePath('/dashboard/modules/purchases');
  revalidatePath('/admin/module-orders');

  return { success: true, order };
}

/**
 * User: Upload payment proof for an order
 */
export async function uploadPaymentProof(orderId: string, paymentProofUrl: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, 'balikin_id'),
    ),
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Unauthorized: This is not your order');
  }

  if (order.status !== 'pending_payment') {
    throw new Error('Order is not in pending_payment status');
  }

  // The upload route persists the server-issued object URL before this action runs.
  // Bind the proof to that record instead of trusting a client-supplied blob URL.
  if (!paymentProofUrl || order.paymentProofUrl !== paymentProofUrl) {
    throw new Error('URL bukti pembayaran tidak valid');
  }

  // Update order with payment proof
  const updatedOrders = await db
    .update(modulePurchaseOrders)
    .set({
      paymentProofUrl,
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.userId, userId),
      eq(modulePurchaseOrders.app_id, 'balikin_id'),
      eq(modulePurchaseOrders.status, 'pending_payment'),
    ))
    .returning({ id: modulePurchaseOrders.id });

  if (updatedOrders.length === 0) {
    throw new Error('Order is not in pending_payment status');
  }

  revalidatePath('/dashboard/modules/purchases');
  revalidatePath('/admin/module-orders');

  return { success: true };
}

/**
 * Admin: Get all purchase orders with optional status filter
 */
export async function getModulePurchaseOrders(statusFilter?: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const whereClause = statusFilter && statusFilter !== 'all'
    ? and(
      eq(modulePurchaseOrders.app_id, APP_ID),
      eq(modulePurchaseOrders.status, statusFilter)
    ) ?? eq(modulePurchaseOrders.app_id, APP_ID)
    : eq(modulePurchaseOrders.app_id, APP_ID);

  const orders = await db.query.modulePurchaseOrders.findMany({
    where: whereClause,
    orderBy: [desc(modulePurchaseOrders.requestedAt)],
    with: {
      user: true,
      reviewer: true,
    },
  });

  return orders;
}

/**
 * Admin: Get order statistics
 */
export async function getOrderStats() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const pendingPaymentResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(and(
      eq(modulePurchaseOrders.status, 'pending_payment'),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  const awaitingVerificationResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(and(
      eq(modulePurchaseOrders.status, 'paid'),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  const approvedResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(and(
      eq(modulePurchaseOrders.status, 'approved'),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  const rejectedResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(and(
      eq(modulePurchaseOrders.status, 'rejected'),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  return {
    pendingPayment: pendingPaymentResult[0]?.count || 0,
    awaitingVerification: awaitingVerificationResult[0]?.count || 0,
    approved: approvedResult[0]?.count || 0,
    rejected: rejectedResult[0]?.count || 0,
  };
}

/**
 * Admin: Approve a purchase order
 */
export async function approveModulePurchaseOrder(orderId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const adminId = dbUser.id;

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ),
    with: {
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const orderUser = Array.isArray(order.user) ? order.user[0] : order.user;
  if (!orderUser) {
    throw new Error('Order user not found');
  }

  if (order.status !== 'paid') {
    throw new Error('Order must be in paid status before approval');
  }

  // Enable the module for the user
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, order.userId),
      eq(userModulePermissions.moduleType, order.moduleType),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  if (existingPermission) {
    // Update existing permission
    await db
      .update(userModulePermissions)
      .set({
        isEnabled: true,
        grantedBy: adminId,
        grantedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(userModulePermissions.id, existingPermission.id),
        eq(userModulePermissions.app_id, APP_ID)
      ));
  } else {
    // Create new permission
    await db.insert(userModulePermissions).values({
      app_id: APP_ID,
      userId: order.userId,
      moduleType: order.moduleType as ModuleType,
      isEnabled: true,
      grantedBy: adminId,
      grantedAt: new Date(),
    });
  }

  // Log analytics
  await db.insert(moduleUsageAnalytics).values({
    app_id: APP_ID,
    userId: order.userId,
    moduleType: order.moduleType,
    actionType: 'activate',
    performedBy: adminId,
  });

  // Update order status
  await db
    .update(modulePurchaseOrders)
    .set({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      updatedAt: new Date(),
    })
    .where(and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  // Send WhatsApp notification to user
  try {
    await sendModuleApprovedNotificationToUser({
       phoneNumber: orderUser.email, // Fallback to email
       userName: orderUser.name || 'Pengguna',
      moduleType: order.moduleType,
    });
  } catch (error) {
    console.error('[Module Approval] Failed to send WhatsApp notification:', error);
  }

  revalidatePath('/admin/module-orders');
  revalidatePath('/dashboard/modules');
  revalidatePath('/admin/modules');

  return { success: true };
}

/**
 * Admin: Reject a purchase order
 */
export async function rejectModulePurchaseOrder({
  orderId,
  rejectionReason,
}: {
  orderId: string;
  rejectionReason?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const adminId = dbUser.id;

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ),
    with: {
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const orderUser = Array.isArray(order.user) ? order.user[0] : order.user;
  if (!orderUser) {
    throw new Error('Order user not found');
  }

  // Update order status
  await db
    .update(modulePurchaseOrders)
    .set({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason,
      updatedAt: new Date(),
    })
    .where(and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  // Send WhatsApp notification to user
  try {
    await sendModuleRejectedNotificationToUser({
       phoneNumber: orderUser.email, // Fallback to email
       userName: orderUser.name || 'Pengguna',
      moduleType: order.moduleType,
      rejectionReason,
    });
  } catch (error) {
    console.error('[Module Rejection] Failed to send WhatsApp notification:', error);
  }

  revalidatePath('/admin/module-orders');
  revalidatePath('/dashboard/modules/purchases');

  return { success: true };
}

/**
 * User: Get their own purchase orders
 */
export async function getUserModulePurchaseOrders() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const orders = await db.query.modulePurchaseOrders.findMany({
    where: and(
      eq(modulePurchaseOrders.userId, session.user.id),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ),
    orderBy: [desc(modulePurchaseOrders.requestedAt)],
    with: {
      moduleConfig: true,
    },
  });

  return orders;
}

/**
 * Admin: Cancel an order (for pending orders only)
 */
export async function cancelModulePurchaseOrder(orderId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ),
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending_payment') {
    throw new Error('Can only cancel pending_payment orders');
  }

  // Update order status
  await db
    .update(modulePurchaseOrders)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  revalidatePath('/admin/module-orders');
  revalidatePath('/dashboard/modules/purchases');

  return { success: true };
}

/**
 * Send payment reminder for pending orders
 */
export async function sendPaymentReminder(orderId: string) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ),
    with: {
      user: true,
      moduleConfig: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'pending_payment') {
    throw new Error('Can only send reminder for pending_payment orders');
  }

  // Update notification flag
  await db
    .update(modulePurchaseOrders)
    .set({
      whatsappNotificationSent: true,
      updatedAt: new Date(),
    })
    .where(and(
      eq(modulePurchaseOrders.id, orderId),
      eq(modulePurchaseOrders.app_id, APP_ID)
    ));

  // Send WhatsApp notification (implement in lib/whatsapp.ts)
  // TODO: Implement sendPaymentReminderNotification function

  revalidatePath('/admin/module-orders');

  return { success: true };
}

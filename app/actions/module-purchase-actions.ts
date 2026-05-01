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
    where: eq(moduleConfig.moduleType, moduleType),
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
      eq(userModulePermissions.moduleType, moduleType)
    ),
  });

  if (existingPermission?.isEnabled) {
    throw new Error('You already have access to this module');
  }

  // Check if there's already a pending order for this module
  const pendingOrder = await db.query.modulePurchaseOrders.findFirst({
    where: and(
      eq(modulePurchaseOrders.userId, userId),
      eq(modulePurchaseOrders.moduleType, moduleType),
      eq(modulePurchaseOrders.status, 'pending_payment')
    ),
  });

  if (pendingOrder) {
    // Return existing order
    return { success: true, order: pendingOrder };
  }

  // Create the order
  const order = await db.insert(modulePurchaseOrders).values({
    userId,
    moduleType,
    status: 'pending_payment',
    amount: moduleConfigData.price,
    paymentMethod: 'manual_qris',
  }).returning();

  // Send WhatsApp notification to admin
  try {
    await sendModulePurchaseNotificationToAdmin({
      orderId: order[0].id,
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

  return { success: true, order: order[0] };
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
    where: eq(modulePurchaseOrders.id, orderId),
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

  // Update order with payment proof
  await db
    .update(modulePurchaseOrders)
    .set({
      paymentProofUrl,
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(modulePurchaseOrders.id, orderId));

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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  let whereClause = undefined;
  if (statusFilter && statusFilter !== 'all') {
    whereClause = eq(modulePurchaseOrders.status, statusFilter);
  }

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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const pendingPaymentResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(eq(modulePurchaseOrders.status, 'pending_payment'));

  const awaitingVerificationResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(eq(modulePurchaseOrders.status, 'paid'));

  const approvedResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(eq(modulePurchaseOrders.status, 'approved'));

  const rejectedResult = await db
    .select({ count: count() })
    .from(modulePurchaseOrders)
    .where(eq(modulePurchaseOrders.status, 'rejected'));

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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const adminId = dbUser.id;

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: eq(modulePurchaseOrders.id, orderId),
    with: {
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'paid') {
    throw new Error('Order must be in paid status before approval');
  }

  // Enable the module for the user
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, order.userId),
      eq(userModulePermissions.moduleType, order.moduleType)
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
      .where(eq(userModulePermissions.id, existingPermission.id));
  } else {
    // Create new permission
    await db.insert(userModulePermissions).values({
      userId: order.userId,
      moduleType: order.moduleType as ModuleType,
      isEnabled: true,
      grantedBy: adminId,
      grantedAt: new Date(),
    });
  }

  // Log analytics
  await db.insert(moduleUsageAnalytics).values({
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
    .where(eq(modulePurchaseOrders.id, orderId));

  // Send WhatsApp notification to user
  try {
    await sendModuleApprovedNotificationToUser({
      phoneNumber: order.user.email, // Fallback to email
      userName: order.user.name || 'Pengguna',
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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  const adminId = dbUser.id;

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: eq(modulePurchaseOrders.id, orderId),
    with: {
      user: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
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
    .where(eq(modulePurchaseOrders.id, orderId));

  // Send WhatsApp notification to user
  try {
    await sendModuleRejectedNotificationToUser({
      phoneNumber: order.user.email, // Fallback to email
      userName: order.user.name || 'Pengguna',
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
    where: eq(modulePurchaseOrders.userId, session.user.id),
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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: eq(modulePurchaseOrders.id, orderId),
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
    .where(eq(modulePurchaseOrders.id, orderId));

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
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  // Get the order
  const order = await db.query.modulePurchaseOrders.findFirst({
    where: eq(modulePurchaseOrders.id, orderId),
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
    .where(eq(modulePurchaseOrders.id, orderId));

  // Send WhatsApp notification (implement in lib/whatsapp.ts)
  // TODO: Implement sendPaymentReminderNotification function

  revalidatePath('/admin/module-orders');

  return { success: true };
}

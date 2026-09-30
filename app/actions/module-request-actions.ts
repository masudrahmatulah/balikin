'use server';

import { db } from '@/db';
import { moduleRequests, userModulePermissions, moduleUsageAnalytics, user } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { ModuleType } from '@/lib/admin-modules';
import {
  sendModuleRequestNotificationToAdmin,
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
 * User: Request a module
 */
export async function requestModule({
  moduleType,
  reason,
}: {
  moduleType: ModuleType;
  reason?: string;
}) {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Check if user already has this module enabled
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.moduleType, moduleType),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  if (existingPermission?.isEnabled) {
    throw new Error('Module already enabled');
  }

  const created = await db.transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.id, userId), eq(user.app_id, APP_ID)))
      .for('update');

    const [pendingRequest] = await tx
      .select()
      .from(moduleRequests)
      .where(and(
        eq(moduleRequests.userId, userId),
        eq(moduleRequests.moduleType, moduleType),
        eq(moduleRequests.status, 'pending'),
        eq(moduleRequests.app_id, APP_ID)
      ))
      .limit(1);

    if (pendingRequest) {
      return false;
    }

    await tx.insert(moduleRequests).values({
      app_id: APP_ID,
      userId,
      moduleType,
      status: 'pending',
      reason,
    });

    return true;
  });

  if (!created) {
    throw new Error('Request already pending');
  }

  // Send WhatsApp notification to admin
  try {
    await sendModuleRequestNotificationToAdmin({
      userName: session.user.name || 'Pengguna',
      userEmail: session.user.email,
      moduleType,
      reason,
    });
  } catch (error) {
    console.error('[Module Request] Failed to send WhatsApp notification:', error);
    // Continue even if WhatsApp fails
  }

  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * Admin: Get all pending module requests
 */
export async function getPendingModuleRequests() {
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

  const requests = await db.query.moduleRequests.findMany({
    where: and(
      eq(moduleRequests.status, 'pending'),
      eq(moduleRequests.app_id, APP_ID)
    ),
    orderBy: [desc(moduleRequests.requestedAt)],
    with: {
      user: true,
    },
  });

  return requests;
}

/**
 * Admin: Approve a module request
 */
export async function approveModuleRequest(requestId: string) {
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

  // Get the request
  const request = await db.query.moduleRequests.findFirst({
    where: and(
      eq(moduleRequests.id, requestId),
      eq(moduleRequests.app_id, APP_ID)
    ),
    with: {
      user: true,
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  const requestUser = Array.isArray(request.user) ? request.user[0] : request.user;
  if (!requestUser) {
    throw new Error('Request user not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Request already processed');
  }

  // Enable the module for the user
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, request.userId),
      eq(userModulePermissions.moduleType, request.moduleType),
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
      userId: request.userId,
      moduleType: request.moduleType,
      isEnabled: true,
      grantedBy: adminId,
      grantedAt: new Date(),
    });
  }

  // Log analytics
  await db.insert(moduleUsageAnalytics).values({
    app_id: APP_ID,
    userId: request.userId,
    moduleType: request.moduleType,
    actionType: 'activate',
    performedBy: adminId,
  });

  // Update request status
  await db
    .update(moduleRequests)
    .set({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleRequests.id, requestId),
      eq(moduleRequests.app_id, APP_ID)
    ));

  // Send WhatsApp notification to user
  try {
    await sendModuleApprovedNotificationToUser({
       phoneNumber: requestUser.email, // Fallback to email for now
       userName: requestUser.name || 'Pengguna',
      moduleType: request.moduleType,
    });
  } catch (error) {
    console.error('[Module Approval] Failed to send WhatsApp notification:', error);
    // Continue even if WhatsApp fails
  }

  revalidatePath('/admin/requests');
  revalidatePath('/admin/modules');
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * Admin: Reject a module request
 */
export async function rejectModuleRequest({
  requestId,
  rejectionReason,
}: {
  requestId: string;
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

  // Get the request
  const request = await db.query.moduleRequests.findFirst({
    where: and(
      eq(moduleRequests.id, requestId),
      eq(moduleRequests.app_id, APP_ID)
    ),
    with: {
      user: true,
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  const requestUser = Array.isArray(request.user) ? request.user[0] : request.user;
  if (!requestUser) {
    throw new Error('Request user not found');
  }

  if (request.status !== 'pending') {
    throw new Error('Request already processed');
  }

  // Update request status
  await db
    .update(moduleRequests)
    .set({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason,
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleRequests.id, requestId),
      eq(moduleRequests.app_id, APP_ID)
    ));

  // Send WhatsApp notification to user
  try {
    await sendModuleRejectedNotificationToUser({
       phoneNumber: requestUser.email, // Fallback to email for now
       userName: requestUser.name || 'Pengguna',
      moduleType: request.moduleType,
      rejectionReason,
    });
  } catch (error) {
    console.error('[Module Rejection] Failed to send WhatsApp notification:', error);
    // Continue even if WhatsApp fails
  }

  revalidatePath('/admin/requests');
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * User: Get their own request history
 */
export async function getUserModuleRequests() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const requests = await db.query.moduleRequests.findMany({
    where: and(
      eq(moduleRequests.userId, session.user.id),
      eq(moduleRequests.app_id, APP_ID)
    ),
    orderBy: [desc(moduleRequests.requestedAt)],
  });

  return requests;
}

/**
 * Get pending requests count for a user (by module type)
 */
export async function getUserPendingRequests() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const requests = await db.query.moduleRequests.findMany({
    where: and(
      eq(moduleRequests.userId, session.user.id),
      eq(moduleRequests.status, 'pending'),
      eq(moduleRequests.app_id, APP_ID)
    ),
  });

  return requests.map((r) => r.moduleType as ModuleType);
}

/**
 * Admin: Approve module request from form (requestId from formData)
 */
export async function approveModuleRequestFromForm(formData: FormData) {
  const requestId = formData.get('requestId') as string;
  await approveModuleRequest(requestId);
}

/**
 * Admin: Reject module request from form (requestId from formData)
 */
export async function rejectModuleRequestFromForm(formData: FormData) {
  const requestId = formData.get('requestId') as string;
  const rejectionReason = formData.get('rejectionReason') as string | undefined;
  await rejectModuleRequest({ requestId, rejectionReason });
}

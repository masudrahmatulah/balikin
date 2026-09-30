'use server';

import { db } from '@/db';
import { userModulePermissions, user, moduleUsageAnalytics } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { ModuleType } from '@/lib/admin-modules';

// Constants
const MAX_REASON_LENGTH = 500;
const MAX_USER_IDS = 100;
const APP_ID = 'balikin_id';

/**
 * Helper to get admin session directly in server actions
 */
async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.app_id, APP_ID)),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: dbUser.role as "admin",
    },
  };
}

/**
 * Get all module permissions for a specific user (cached)
 */
export async function getUserModulePermissions(userId: string) {

  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  const permissions = await db.query.userModulePermissions.findMany({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  return permissions;
}

/**
 * Set module permission for a user (enable/disable)
 */
export async function setUserModulePermission({
  userId,
  moduleType,
  isEnabled,
  reason,
}: {
  userId: string;
  moduleType: ModuleType;
  isEnabled: boolean;
  reason?: string;
}) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  const adminId = adminSession.user.id;

  // Check if permission record exists
  const existing = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.moduleType, moduleType),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  if (existing) {
    // Update existing record
    await db
      .update(userModulePermissions)
      .set({
        isEnabled,
        grantedBy: isEnabled ? adminId : null,
        grantedAt: isEnabled ? new Date() : null,
        reason,
        updatedAt: new Date(),
      })
      .where(and(
        eq(userModulePermissions.id, existing.id),
        eq(userModulePermissions.app_id, APP_ID)
      ));

    // Log analytics only if status changed
    if (existing.isEnabled !== isEnabled) {
      await db.insert(moduleUsageAnalytics).values({
        app_id: APP_ID,
        userId,
        moduleType,
        actionType: isEnabled ? 'activate' : 'deactivate',
        performedBy: adminId,
      });
    }
  } else {
    // Create new record
    await db.insert(userModulePermissions).values({
      app_id: APP_ID,
      userId,
      moduleType,
      isEnabled,
      grantedBy: isEnabled ? adminId : null,
      grantedAt: isEnabled ? new Date() : null,
      reason,
    });

    // Log analytics for new permission
    if (isEnabled) {
      await db.insert(moduleUsageAnalytics).values({
        app_id: APP_ID,
        userId,
        moduleType,
        actionType: 'activate',
        performedBy: adminId,
      });
    }
  }

  revalidatePath('/admin/modules');
  revalidatePath(`/admin/client/${userId}`);

  return { success: true };
}

/**
 * Get all users with their module permissions (cached)
 */
export async function getUsersWithModulePermissions() {

  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  const users = await db.query.user.findMany({
    where: eq(user.app_id, APP_ID),
    orderBy: [desc(user.createdAt)],
    with: {
      userModulePermissions: true,
    },
  });

  return users;
}

/**
 * Bulk set module permissions for multiple users
 * Optimized with aggregate operations instead of sequential queries
 */
export async function bulkSetModulePermissions({
  userIds,
  moduleType,
  isEnabled,
  reason,
}: {
  userIds: string[];
  moduleType: ModuleType;
  isEnabled: boolean;
  reason?: string;
}) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  if (userIds.length > MAX_USER_IDS) {
    throw new Error(`Maksimal ${MAX_USER_IDS} user ID per batch`);
  }

  const adminId = adminSession.user.id;
  const sanitizedReason = reason?.trim().slice(0, MAX_REASON_LENGTH) || null;

  // Get all existing permissions in a single query
  const existingPermissions = await db.query.userModulePermissions.findMany({
    where: and(
      inArray(userModulePermissions.userId, userIds),
      eq(userModulePermissions.moduleType, moduleType),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  // Create a Map for O(1) lookup
  const existingMap = new Map(
    existingPermissions.map(p => [p.userId, p])
  );

  // Separate into updates and inserts
  const toUpdate: string[] = [];
  const toInsert: typeof userIds = [];

  userIds.forEach(userId => {
    const existing = existingMap.get(userId);
    if (existing) {
      if (existing.isEnabled !== isEnabled) {
        toUpdate.push(existing.id);
      }
    } else if (isEnabled) {
      toInsert.push(userId);
    }
  });

  // Perform bulk operations
  await Promise.allSettled([
    // Bulk update existing permissions
      toUpdate.length > 0 ? db.update(userModulePermissions)
      .set({
        isEnabled,
        grantedBy: isEnabled ? adminId : null,
        grantedAt: isEnabled ? new Date() : null,
        reason: sanitizedReason,
        updatedAt: new Date(),
      })
        .where(and(
          inArray(userModulePermissions.id, toUpdate),
          eq(userModulePermissions.app_id, APP_ID)
        )) : Promise.resolve(),

    // Bulk insert new permissions
    toInsert.length > 0 ? db.insert(userModulePermissions)
      .values(toInsert.map(userId => ({
        app_id: APP_ID,
        userId,
        moduleType,
        isEnabled,
        grantedBy: isEnabled ? adminId : null,
        grantedAt: isEnabled ? new Date() : null,
        reason: sanitizedReason,
      }))) : Promise.resolve(),
  ]);

  // Log analytics in parallel
  const analyticsToLog = [
    ...existingPermissions.filter(p => p.isEnabled !== isEnabled).map(p => ({
      userId: p.userId,
      moduleType,
      actionType: isEnabled ? 'activate' as const : 'deactivate' as const,
      performedBy: adminId,
      app_id: APP_ID,
    })),
    ...toInsert.map(userId => ({
      userId,
      moduleType,
      actionType: 'activate' as const,
      performedBy: adminId,
      app_id: APP_ID,
    })),
  ];

  if (analyticsToLog.length > 0) {
    await db.insert(moduleUsageAnalytics).values(analyticsToLog);
  }

  revalidatePath('/admin/modules');

  return { success: true, count: userIds.length };
}

/**
 * Get enabled modules for a user (client-side)
 */
export async function getEnabledModulesForUser(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const isSelf = session.user.id === userId;
  if (!isSelf && !await getAdminSession()) {
    throw new Error('Forbidden');
  }

  const permissions = await db.query.userModulePermissions.findMany({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.isEnabled, true),
      eq(userModulePermissions.app_id, APP_ID)
    ),
  });

  return permissions.map((p) => p.moduleType as ModuleType);
}

'use server';

import { cache } from 'react';
import { db } from '@/db';
import { userModulePermissions, user, moduleUsageAnalytics } from '@/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath, cacheTag } from 'next/cache';
import type { ModuleType } from '@/lib/admin-modules';

// Constants
const MAX_REASON_LENGTH = 500;
const MAX_USER_IDS = 100;

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
    where: eq(user.id, session.user.id),
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
  cacheTag('user-module-permissions', `user-${userId}`);

  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  const permissions = await db.query.userModulePermissions.findMany({
    where: eq(userModulePermissions.userId, userId),
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
      eq(userModulePermissions.moduleType, moduleType)
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
      .where(eq(userModulePermissions.id, existing.id));

    // Log analytics only if status changed
    if (existing.isEnabled !== isEnabled) {
      await db.insert(moduleUsageAnalytics).values({
        userId,
        moduleType,
        actionType: isEnabled ? 'activate' : 'deactivate',
        performedBy: adminId,
      });
    }
  } else {
    // Create new record
    await db.insert(userModulePermissions).values({
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
  cacheTag('user-module-permissions');

  const adminSession = await getAdminSession();

  if (!adminSession) {
    throw new Error('Unauthorized: Admin access required');
  }

  const users = await db.query.user.findMany({
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
      eq(userModulePermissions.moduleType, moduleType)
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
      .where(inArray(userModulePermissions.id, toUpdate)) : Promise.resolve(),

    // Bulk insert new permissions
    toInsert.length > 0 ? db.insert(userModulePermissions)
      .values(toInsert.map(userId => ({
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
      actionType: (isEnabled ? 'activate' : 'deactivate') as const,
      performedBy: adminId,
    })),
    ...toInsert.map(userId => ({
      userId,
      moduleType,
      actionType: 'activate' as const,
      performedBy: adminId,
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
  const permissions = await db.query.userModulePermissions.findMany({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.isEnabled, true)
    ),
  });

  return permissions.map((p) => p.moduleType as ModuleType);
}

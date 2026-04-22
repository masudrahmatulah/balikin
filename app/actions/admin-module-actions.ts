'use server';

import { db } from '@/db';
import { userModulePermissions, user, moduleUsageAnalytics } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { revalidatePath } from 'next/cache';
import type { ModuleType } from '@/lib/admin-modules';

/**
 * Get all module permissions for a specific user
 */
export async function getUserModulePermissions(userId: string) {
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
 * Get all users with their module permissions
 */
export async function getUsersWithModulePermissions() {
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

  const adminId = adminSession.user.id;

  for (const userId of userIds) {
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
    }
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

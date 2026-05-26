'use server';

import { cache } from 'react';
import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { moduleConfig, userModulePermissions, modulePurchaseOrders, user } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import type { ModuleType } from '@/lib/admin-modules';
import { MODULES } from '@/lib/admin-modules';

/**
 * Get all module configurations with caching
 */
async function getAllModuleConfigsCore() {
  'use cache';
  cacheLife('hours');
  cacheTag('module-configs', 'admin-modules');

  const configs = await db.query.moduleConfig.findMany({
    orderBy: [moduleConfig.sortOrder, moduleConfig.moduleType],
  });

  return configs;
}

/**
 * Cached version of getAllModuleConfigs
 */
export const getAllModuleConfigs = cache(getAllModuleConfigsCore);

/**
 * Get module config by type (public - no auth required)
 */
async function getModuleConfigByTypeCore(moduleType: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`module-config-${moduleType}`);

  const config = await db.query.moduleConfig.findFirst({
    where: eq(moduleConfig.moduleType, moduleType),
  });

  return config;
}

/**
 * Cached version of getModuleConfigByType
 */
export const getModuleConfigByType = cache(getModuleConfigByTypeCore);

/**
 * Get all active module configs (for catalog)
 */
async function getActiveModuleConfigsCore() {
  'use cache';
  cacheLife('hours');
  cacheTag('module-configs', 'active-modules');

  const configs = await db.query.moduleConfig.findMany({
    where: eq(moduleConfig.isEnabled, true),
    orderBy: [moduleConfig.sortOrder, moduleConfig.moduleType],
  });

  return configs;
}

/**
 * Cached version of getActiveModuleConfigs
 */
export const getActiveModuleConfigs = cache(getActiveModuleConfigsCore);

/**
 * Get module statistics with caching
 */
async function getModuleStatsCore() {
  'use cache';
  cacheLife('minutes');
  cacheTag('module-stats', 'admin-modules');

  const configs = await db.query.moduleConfig.findMany();

  const stats = await Promise.all(
    configs.map(async (config) => {
      const [activeUsersResult, pendingOrdersResult, awaitingVerificationResult] = await Promise.all([
        db
          .select({ count: count() })
          .from(userModulePermissions)
          .where(
            and(
              eq(userModulePermissions.moduleType, config.moduleType),
              eq(userModulePermissions.isEnabled, true)
            )
          ),
        db
          .select({ count: count() })
          .from(modulePurchaseOrders)
          .where(
            and(
              eq(modulePurchaseOrders.moduleType, config.moduleType),
              eq(modulePurchaseOrders.status, 'pending_payment')
            )
          ),
        db
          .select({ count: count() })
          .from(modulePurchaseOrders)
          .where(
            and(
              eq(modulePurchaseOrders.moduleType, config.moduleType),
              eq(modulePurchaseOrders.status, 'paid')
            )
          ),
      ]);

      return {
        moduleType: config.moduleType,
        isEnabled: config.isEnabled,
        price: config.price,
        isPaid: config.isPaid,
        activeUsers: activeUsersResult[0]?.count || 0,
        pendingOrders: pendingOrdersResult[0]?.count || 0,
        awaitingVerification: awaitingVerificationResult[0]?.count || 0,
      };
    })
  );

  return stats;
}

/**
 * Cached version of getModuleStats
 */
export const getModuleStats = cache(getModuleStatsCore);

/**
 * Get merged module list with MODULES config and database configs
 * This is used by the admin modules page
 */
export async function getModuleListWithStats() {
  const [configs, stats] = await Promise.all([
    getAllModuleConfigs(),
    getModuleStats(),
  ]);

  const configMap = new Map(configs.map(c => [c.moduleType, c]));

  const moduleList = (Object.keys(MODULES) as ModuleType[]).map(moduleType => {
    const config = configMap.get(moduleType);
    const moduleInfo = MODULES[moduleType];

    return {
      moduleType,
      isEnabled: config?.isEnabled ?? true,
      price: config?.price ?? 0,
      isPaid: config?.isPaid ?? false,
      requiresApproval: config?.requiresApproval ?? true,
      description: config?.description ?? moduleInfo.description,
      features: config?.features ? JSON.parse(config.features) : moduleInfo.benefits,
    };
  });

  return { moduleList, stats };
}

/**
 * Invalidate module-related cache tags
 * Call this after any module configuration change
 */
export async function revalidateModuleCaches(moduleType?: string) {
  revalidateTag('module-configs', 'max');
  revalidateTag('module-stats', 'max');
  revalidateTag('admin-modules', 'max');
  revalidateTag('active-modules', 'max');

  if (moduleType) {
    revalidateTag(`module-config-${moduleType}`, 'max');
  }
}
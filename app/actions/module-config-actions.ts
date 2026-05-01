'use server';

import { db } from '@/db';
import { moduleConfig, modulePurchaseOrders, userModulePermissions, user } from '@/db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { ModuleType } from '@/lib/admin-modules';

/**
 * Helper function to get authenticated session
 */
async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Get all module configurations
 */
export async function getAllModuleConfigs() {
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

  const configs = await db.query.moduleConfig.findMany({
    orderBy: [moduleConfig.sortOrder, moduleConfig.moduleType],
  });

  return configs;
}

/**
 * Get module config by type (public - no auth required)
 */
export async function getModuleConfigByType(moduleType: string) {
  const config = await db.query.moduleConfig.findFirst({
    where: eq(moduleConfig.moduleType, moduleType),
  });

  return config;
}

/**
 * Get all active module configs (for catalog)
 */
export async function getActiveModuleConfigs() {
  const configs = await db.query.moduleConfig.findMany({
    where: eq(moduleConfig.isEnabled, true),
    orderBy: [moduleConfig.sortOrder, moduleConfig.moduleType],
  });

  return configs;
}

/**
 * Check if module is globally enabled
 */
export async function isModuleGloballyEnabled(moduleType: string): Promise<boolean> {
  const config = await db.query.moduleConfig.findFirst({
    where: eq(moduleConfig.moduleType, moduleType),
  });

  return config?.isEnabled ?? false;
}

/**
 * Update module configuration
 */
export async function updateModuleConfig({
  moduleType,
  isEnabled,
  price,
  isPaid,
  requiresApproval,
  description,
  features,
  sortOrder,
}: {
  moduleType: ModuleType;
  isEnabled?: boolean;
  price?: number;
  isPaid?: boolean;
  requiresApproval?: boolean;
  description?: string;
  features?: string[];
  sortOrder?: number;
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

  // Check if config exists
  const existing = await db.query.moduleConfig.findFirst({
    where: eq(moduleConfig.moduleType, moduleType),
  });

  const featuresJson = features ? JSON.stringify(features) : undefined;

  if (existing) {
    // Update existing
    await db
      .update(moduleConfig)
      .set({
        ...(isEnabled !== undefined && { isEnabled }),
        ...(price !== undefined && { price }),
        ...(isPaid !== undefined && { isPaid }),
        ...(requiresApproval !== undefined && { requiresApproval }),
        ...(description !== undefined && { description }),
        ...(featuresJson && { features: featuresJson }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(moduleConfig.id, existing.id));
  } else {
    // Create new
    await db.insert(moduleConfig).values({
      moduleType,
      isEnabled: isEnabled ?? true,
      price: price ?? 0,
      isPaid: isPaid ?? false,
      requiresApproval: requiresApproval ?? true,
      description: description ?? '',
      features: featuresJson ?? '[]',
      sortOrder: sortOrder ?? 0,
    });
  }

  revalidatePath('/admin/modules');
  revalidatePath('/dashboard/modules');

  return { success: true };
}

/**
 * Toggle module global status (enable/disable)
 */
export async function toggleModuleStatus(moduleType: string, isEnabled: boolean) {
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

  const existing = await db.query.moduleConfig.findFirst({
    where: eq(moduleConfig.moduleType, moduleType),
  });

  if (existing) {
    await db
      .update(moduleConfig)
      .set({
        isEnabled,
        updatedAt: new Date(),
      })
      .where(eq(moduleConfig.id, existing.id));
  } else {
    // Create with default values
    await db.insert(moduleConfig).values({
      moduleType: moduleType as ModuleType,
      isEnabled,
      price: 0,
      isPaid: false,
      requiresApproval: true,
      description: '',
      features: '[]',
      sortOrder: 0,
    });
  }

  revalidatePath('/admin/modules');
  revalidatePath('/dashboard/modules');

  return { success: true };
}

/**
 * Get module statistics
 */
export async function getModuleStats() {
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

  const configs = await db.query.moduleConfig.findMany();

  const stats = await Promise.all(
    configs.map(async (config) => {
      // Count active users with this module enabled
      const activeUsersResult = await db
        .select({ count: count() })
        .from(userModulePermissions)
        .where(
          and(
            eq(userModulePermissions.moduleType, config.moduleType),
            eq(userModulePermissions.isEnabled, true)
          )
        );

      // Count pending orders
      const pendingOrdersResult = await db
        .select({ count: count() })
        .from(modulePurchaseOrders)
        .where(
          and(
            eq(modulePurchaseOrders.moduleType, config.moduleType),
            eq(modulePurchaseOrders.status, 'pending_payment')
          )
        );

      // Count awaiting verification orders
      const awaitingVerificationResult = await db
        .select({ count: count() })
        .from(modulePurchaseOrders)
        .where(
          and(
            eq(modulePurchaseOrders.moduleType, config.moduleType),
            eq(modulePurchaseOrders.status, 'paid')
          )
        );

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
 * Initialize default module configs
 */
export async function initializeDefaultModuleConfigs() {
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

  const defaultConfigs = [
    {
      moduleType: 'student' as ModuleType,
      isEnabled: true,
      price: 0,
      isPaid: false,
      requiresApproval: false,
      description: 'Kelola jadwal kuliah & deadline - hemat 3 jam/minggu!',
      features: JSON.stringify([
        'Satu tempat untuk jadwal, deadline & link materi',
        'Notifikasi WhatsApp otomatis sebelum deadline',
        'Bagikan jadwal ke teman dengan satu link',
        'Simpan KTM/KRS sebagai foto digital',
        'Buat vCard profesional untuk networking'
      ]),
      sortOrder: 1,
    },
    {
      moduleType: 'otomotif' as ModuleType,
      isEnabled: true,
      price: 50000,
      isPaid: true,
      requiresApproval: true,
      description: 'Pantau STNK, servis, & klaim asuransi dalam satu tempat',
      features: JSON.stringify([
        'Tidak perlu ingat tanggal jatuh tempo STNK',
        'Jadwal ganti oli & servis terkelola otomatis',
        'Riwayat servis terdokumentasi lengkap',
        'Data asuransi & klaim dalam genggaman',
        'Hindari denda & tilang akibat lupa jatuh tempo'
      ]),
      sortOrder: 2,
    },
    {
      moduleType: 'pertanian' as ModuleType,
      isEnabled: true,
      price: 75000,
      isPaid: true,
      requiresApproval: true,
      description: 'Hitung HST & jadwal pupuk otomatis untuk hasil panen maksimal',
      features: JSON.stringify([
        'Kalkulator HST (Hari Setelah Tanam) otomatis',
        'Jadwal pemupukan tepat waktu',
        'Catatan panen & biaya tenaga kerja',
        'Optimalkan hasil panen dengan perencanaan baik',
        'Hindari kesalahan timing yang merugikan'
      ]),
      sortOrder: 3,
    },
    {
      moduleType: 'diklat' as ModuleType,
      isEnabled: true,
      price: 100000,
      isPaid: true,
      requiresApproval: true,
      description: 'Manage acara B2B, sertifikat, & materi training dengan mudah',
      features: JSON.stringify([
        'Tracking kehadiran peserta real-time',
        'Materi & sertifikat terorganisir per event',
        'QR code untuk check-in peserta',
        'Rundown schedule yang terstruktur',
        'Professional untuk event klien & internal'
      ]),
      sortOrder: 4,
    },
  ];

  for (const config of defaultConfigs) {
    const existing = await db.query.moduleConfig.findFirst({
      where: eq(moduleConfig.moduleType, config.moduleType),
    });

    if (!existing) {
      await db.insert(moduleConfig).values(config);
    }
  }

  // Note: No revalidatePath here as this is called during render
  // Revalidation will happen on next page load

  return { success: true, count: defaultConfigs.length };
}

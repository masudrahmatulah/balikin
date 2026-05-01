'use server';

import { db } from '@/db';
import { tags, userModulePermissions, userModuleSelections, moduleUsageAnalytics } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { BundleType, getBundleConfig } from '@/lib/bundles';
import type { ModuleType } from '@/lib/admin-modules';

export interface ClaimBundleInput {
  tagId: string;
  name?: string;
  contactWhatsapp?: string;
  skipModule?: boolean;
}

/**
 * Claim a bundle tag with auto-module activation
 * This is used for Student Kit Keychain and other bundle products
 */
export async function claimBundleTag(input: ClaimBundleInput) {
  const { tagId, name, contactWhatsapp, skipModule = false } = input;

  // Get session
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    // Fallback to manual session reading
    const { cookies } = await import('next/headers');
    const { session: sessionTable, user } = await import('@/db/schema');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (sessionToken) {
      const sessionRecord = await db
        .select({
          session: sessionTable,
          user: user,
        })
        .from(sessionTable)
        .innerJoin(user, eq(sessionTable.userId, user.id))
        .where(eq(sessionTable.token, sessionToken))
        .limit(1);

      if (sessionRecord.length && new Date(sessionRecord[0].session.expiresAt) > new Date()) {
        session = {
          user: sessionRecord[0].user,
          session: sessionRecord[0].session,
        };
      }
    }
  }

  if (!session?.user?.id) {
    redirect('/sign-in?redirect=' + encodeURIComponent(`/claim/${tagId}`));
  }

  // Get tag
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    throw new Error('Tag tidak ditemukan');
  }

  if (tag.ownerId && tag.ownerId !== session.user.id) {
    throw new Error('Tag sudah dimiliki oleh user lain');
  }

  // Get bundle config
  const bundleConfig = getBundleConfig(tag.bundleType as BundleType);
  if (!bundleConfig) {
    throw new Error('Tipe bundle tidak valid');
  }

  // Claim the tag
  await db.update(tags)
    .set({
      ownerId: session.user.id,
      name: name?.trim() || bundleConfig.name,
      contactWhatsapp: contactWhatsapp || tag.contactWhatsapp || session.user.email,
      claimedAt: new Date(),
      status: 'normal',
      productType: 'bundle',
      tier: 'premium',
      isVerified: true,
      whatsappAlertsEnabled: true,
      hasTabTwoEnabled: true, // Enable dual-tab for bundle tags
    })
    .where(eq(tags.id, tagId));

  // Auto-activate module if configured and not skipped
  if (bundleConfig.moduleType && !skipModule) {
    await activateModuleForUser(session.user.id, bundleConfig.moduleType);
  }

  // Redirect based on bundle type
  if (bundleConfig.moduleType === 'student') {
    redirect(`/p/${tag.slug}/private/student/onboarding`);
  } else if (bundleConfig.moduleType) {
    redirect(`/p/${tag.slug}/private/${bundleConfig.moduleType}`);
  } else {
    redirect('/dashboard');
  }
}

/**
 * Activate a module for a user
 * This creates both the permission and selection records
 */
async function activateModuleForUser(userId: string, moduleType: ModuleType) {
  // Check if user already has this module
  const existingPermission = await db.query.userModulePermissions.findFirst({
    where: and(
      eq(userModulePermissions.userId, userId),
      eq(userModulePermissions.moduleType, moduleType)
    ),
  });

  if (existingPermission?.isEnabled) {
    // Module already enabled, skip
    return;
  }

  // Create or update permission
  if (existingPermission) {
    await db.update(userModulePermissions)
      .set({
        isEnabled: true,
        grantedAt: new Date(),
      })
      .where(eq(userModulePermissions.id, existingPermission.id));
  } else {
    await db.insert(userModulePermissions).values({
      userId,
      moduleType,
      isEnabled: true,
      grantedAt: new Date(),
    });
  }

  // Create module selection
  const existingSelection = await db.query.userModuleSelections.findFirst({
    where: and(
      eq(userModuleSelections.userId, userId),
      eq(userModuleSelections.moduleType, moduleType)
    ),
  });

  if (!existingSelection) {
    await db.insert(userModuleSelections).values({
      userId,
      moduleType,
      isActive: true,
    });
  }

  // Log the activation for analytics
  await db.insert(moduleUsageAnalytics).values({
    userId,
    moduleType,
    actionType: 'activate',
    performedBy: userId, // Self-activated
  });
}

/**
 * Check if a tag is a bundle tag
 */
export async function isBundleTag(tagId: string): Promise<boolean> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  return tag?.bundleType !== null && tag?.bundleType !== undefined;
}

/**
 * Get bundle info for a tag
 */
export async function getBundleInfo(tagId: string) {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag?.bundleType) {
    return null;
  }

  return getBundleConfig(tag.bundleType);
}

/**
 * Mark onboarding as completed for a tag
 */
export async function completeOnboarding(tagId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.update(tags)
    .set({ onboardingCompleted: true })
    .where(eq(tags.id, tagId));

  return { success: true };
}

/**
 * Mark welcome as shown for a tag
 */
export async function markWelcomeShown(tagId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  await db.update(tags)
    .set({ welcomeShown: true })
    .where(eq(tags.id, tagId));

  return { success: true };
}

'use server';

import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { ProductType } from '@/lib/product';

export interface CreateTagInput {
  name: string;
  contactWhatsapp: string;
  customMessage?: string;
  rewardNote?: string;
  tier?: 'free' | 'premium';
  productType?: ProductType;
  isVerified?: boolean;
  emailAlertsEnabled?: boolean;
  whatsappAlertsEnabled?: boolean;
  bundleId?: string;
  claimedAt?: Date;
}

export async function createTag(data: CreateTagInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Check free tier limit for users without premium tags
  if (!data.tier || data.tier === 'free') {
    const userTags = await db.query.tags.findMany({
      where: eq(tags.ownerId, session.user.id),
    });

    const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');
    const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;

    if (!hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT) {
      throw new Error(`Free tier limit reached. Maximum ${FREE_TAG_LIMIT} tags allowed for free users. Please upgrade to premium for unlimited tags.`);
    }
  }

  const slug = nanoid(12);
  const productType = data.productType || 'free';
  const isPremium = productType !== 'free' || data.tier === 'premium';
  const emailAlertsEnabled = isPremium
    ? (data.emailAlertsEnabled ?? false)
    : true;
  const whatsappAlertsEnabled = isPremium
    ? (data.whatsappAlertsEnabled ?? true)
    : false;

  await db.insert(tags).values({
    name: data.name,
    slug,
    ownerId: session.user.id,
    contactWhatsapp: data.contactWhatsapp,
    customMessage: data.customMessage || null,
    rewardNote: data.rewardNote || null,
    status: 'normal',
    tier: data.tier || (isPremium ? 'premium' : 'free'),
    productType,
    isVerified: data.isVerified ?? (productType === 'sticker'),
    emailAlertsEnabled,
    whatsappAlertsEnabled,
    bundleId: data.bundleId || null,
    claimedAt: data.claimedAt || null,
  });

  return { slug };
}

export async function updateTagStatus(tagId: string, status: 'normal' | 'lost') {
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
    .set({ status })
    .where(eq(tags.id, tagId));

  return { success: true };
}

export async function updateTagTier(tagId: string, tier: 'free' | 'premium') {
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
    .set({ tier, productType: tier === 'premium' ? 'acrylic' : 'free' })
    .where(eq(tags.id, tagId));

  return { success: true };
}

export async function updateTagVerified(tagId: string, isVerified: boolean) {
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
    .set({ isVerified })
    .where(eq(tags.id, tagId));

  return { success: true };
}

export async function updateTag(tagId: string, data: Partial<CreateTagInput> & { tier?: 'free' | 'premium'; isVerified?: boolean }) {
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

  const nextProductType = data.productType ?? (tag.productType as ProductType | undefined) ?? (tag.tier === 'premium' ? 'acrylic' : 'free');
  const nextTier = data.tier ?? (nextProductType === 'free' ? 'free' : 'premium');
  const isPremium = nextTier === 'premium';
  const nextEmailAlertsEnabled = isPremium
    ? (data.emailAlertsEnabled ?? tag.emailAlertsEnabled ?? false)
    : true;
  const requestedWhatsAppAlertsEnabled = data.whatsappAlertsEnabled ?? tag.whatsappAlertsEnabled ?? isPremium;
  const nextWhatsAppAlertsEnabled = isPremium ? requestedWhatsAppAlertsEnabled : false;

  await db.update(tags)
    .set({
      name: data.name,
      contactWhatsapp: data.contactWhatsapp,
      customMessage: data.customMessage || null,
      rewardNote: data.rewardNote || null,
      tier: nextTier,
      productType: nextProductType,
      isVerified: data.isVerified,
      emailAlertsEnabled: nextEmailAlertsEnabled,
      whatsappAlertsEnabled: nextWhatsAppAlertsEnabled,
    })
    .where(eq(tags.id, tagId));

  return { success: true };
}

export async function deleteTag(tagId: string) {
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

  await db.delete(tags).where(eq(tags.id, tagId));

  return { success: true };
}

export async function claimTag(tagId: string) {
  // Try Better Auth first, then manual session
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
    redirect('/sign-in');
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  if (tag.ownerId && tag.ownerId !== session.user.id) {
    throw new Error('Tag already owned by another user');
  }

  if (tag.productType === 'sticker') {
    redirect(`/claim/${tagId}?step=name`);
  }

  await db.update(tags)
    .set({ ownerId: session.user.id, claimedAt: new Date() })
    .where(eq(tags.id, tagId));

  redirect('/dashboard');
}

export async function claimStickerTag(tagId: string, name: string) {
  // Try Better Auth first, then manual session reading
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
    redirect('/sign-in');
  }

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  if (tag.ownerId && tag.ownerId !== session.user.id) {
    throw new Error('Tag already owned by another user');
  }

  if (tag.productType !== 'sticker' || !tag.bundleId) {
    throw new Error('Tag ini bukan bagian dari sticker pack');
  }

  const bundle = await db.query.tagBundles.findFirst({
    where: eq(tagBundles.id, tag.bundleId),
  });

  if (!bundle) {
    throw new Error('Bundle sticker tidak ditemukan');
  }

  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, bundle.orderId),
  });

  if (!order) {
    throw new Error('Order sticker tidak ditemukan');
  }

  if (order.userId !== session.user.id) {
    throw new Error('Sticker pack ini terhubung ke akun lain');
  }

  await db.update(tags)
    .set({
      ownerId: session.user.id,
      name: name.trim(),
      claimedAt: new Date(),
      contactWhatsapp: tag.contactWhatsapp || order.phone,
      status: 'normal',
      productType: 'sticker',
      tier: 'premium',
      isVerified: true,
      whatsappAlertsEnabled: true,
    })
    .where(eq(tags.id, tagId));

  redirect('/dashboard');
}

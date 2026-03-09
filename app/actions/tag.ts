'use server';

import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FREE_TAG_LIMIT } from '@/lib/constants';

export interface CreateTagInput {
  name: string;
  contactWhatsapp: string;
  customMessage?: string;
  rewardNote?: string;
  tier?: 'free' | 'premium';
  isVerified?: boolean;
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

  await db.insert(tags).values({
    name: data.name,
    slug,
    ownerId: session.user.id,
    contactWhatsapp: data.contactWhatsapp,
    customMessage: data.customMessage || null,
    rewardNote: data.rewardNote || null,
    status: 'normal',
    tier: data.tier || 'free',
    isVerified: data.isVerified || false,
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
    .set({ tier })
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

  await db.update(tags)
    .set({
      name: data.name,
      contactWhatsapp: data.contactWhatsapp,
      customMessage: data.customMessage || null,
      rewardNote: data.rewardNote || null,
      tier: data.tier,
      isVerified: data.isVerified,
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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

  await db.update(tags)
    .set({ ownerId: session.user.id })
    .where(eq(tags.id, tagId));

  redirect('/dashboard');
}

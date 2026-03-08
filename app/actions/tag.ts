'use server';

import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export interface CreateTagInput {
  name: string;
  contactWhatsapp: string;
  customMessage?: string;
  rewardNote?: string;
}

export async function createTag(data: CreateTagInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
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

export async function updateTag(tagId: string, data: Partial<CreateTagInput>) {
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

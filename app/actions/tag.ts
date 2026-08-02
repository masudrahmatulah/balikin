'use server';

import { db } from '@/db';
import { stickerOrders, tagBundles, tags } from '@/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { ProductType } from '@/lib/product';
import { revalidatePath } from 'next/cache';

function validateTagName(name: string): string {
  if (!name || name.trim().length === 0) {
    throw new Error('Nama tag wajib diisi');
  }
  if (name.length > 100) {
    throw new Error('Nama tag maksimal 100 karakter');
  }
  const trimmed = name.trim();
  if (!/^[\p{L}\p{N}\s\-_.,!?@#$%&*()]+$/u.test(trimmed)) {
    throw new Error('Nama tag mengandung karakter tidak valid');
  }
  return trimmed;
}

function validateWhatsAppNumber(phone: string): string {
  if (!phone || phone.trim().length === 0) {
    throw new Error('Nomor WhatsApp wajib diisi');
  }
  const cleaned = phone.replace(/[\s\-]/g, '');
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  if (!phoneRegex.test(cleaned)) {
    throw new Error('Format nomor WhatsApp tidak valid. Gunakan format: +62812XXXXXXX, 62812XXXXXXX, atau 0812XXXXXXX');
  }
  return cleaned;
}

function validateCustomMessage(message?: string | null): string | null {
  if (!message) return null;
  if (message.length > 500) {
    throw new Error('Pesan custom maksimal 500 karakter');
  }
  return message.trim();
}

function validateRewardNote(note?: string | null): string | null {
  if (!note) return null;
  if (note.length > 200) {
    throw new Error('Catatan imbalan maksimal 200 karakter');
  }
  return note.trim();
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

async function requireSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

async function requireUserId(): Promise<string> {
  const session = await requireSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

async function requireTagOwnership(tagId: string): Promise<string> {
  const userId = await requireUserId();
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag || tag.ownerId !== userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

async function countUserFreeTags(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(tags)
    .where(
      and(
        eq(tags.ownerId, userId),
        sql`${tags.tier} = 'free' OR ${tags.tier} IS NULL`
      )
    );

  return result.count;
}

async function checkFreeTierLimit(userId: string): Promise<void> {
  const [hasPremiumTag] = await db
    .select({ hasPremium: sql<boolean>`EXISTS(SELECT 1 FROM ${tags} WHERE ${tags.ownerId} = ${userId} AND ${tags.tier} = 'premium' LIMIT 1)` })
    .from(tags);

  if (!hasPremiumTag?.hasPremium) {
    const freeTagCount = await countUserFreeTags(userId);
    if (freeTagCount >= FREE_TAG_LIMIT) {
      throw new Error(`Batas gratis tercapai. Maksimal ${FREE_TAG_LIMIT} tag untuk pengguna gratis. Silakan upgrade ke premium untuk tag tak terbatas.`);
    }
  }
}

async function getClaimSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    const { cookies } = await import('next/headers');
    const { session: sessionTable, user } = await import('@/db/schema');
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;

    if (sessionToken) {
      const [sessionRecord] = await db
        .select({
          session: sessionTable,
          user: user,
        })
        .from(sessionTable)
        .innerJoin(user, eq(sessionTable.userId, user.id))
        .where(eq(sessionTable.token, sessionToken))
        .limit(1);

      if (sessionRecord && new Date(sessionRecord.session.expiresAt) > new Date()) {
        return {
          user: sessionRecord.user,
          session: sessionRecord.session,
        };
      }
    }
    return null;
  }
}

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
  const userId = await requireUserId();

  const validatedName = validateTagName(data.name);
  const validatedPhone = validateWhatsAppNumber(data.contactWhatsapp);
  const validatedCustomMessage = validateCustomMessage(data.customMessage);
  const validatedRewardNote = validateRewardNote(data.rewardNote);

  const sanitizedName = sanitizeInput(validatedName);
  const sanitizedCustomMessage = validatedCustomMessage ? sanitizeInput(validatedCustomMessage) : null;
  const sanitizedRewardNote = validatedRewardNote ? sanitizeInput(validatedRewardNote) : null;

  if (!data.tier || data.tier === 'free') {
    await checkFreeTierLimit(userId);
  }

  const slug = nanoid(12);
  const productType = data.productType || 'free';
  const isPremium = productType !== 'free' || data.tier === 'premium';

  await db.insert(tags).values({
    name: sanitizedName,
    slug,
    ownerId: userId,
    contactWhatsapp: validatedPhone,
    customMessage: sanitizedCustomMessage,
    rewardNote: sanitizedRewardNote,
    status: 'normal',
    tier: data.tier || (isPremium ? 'premium' : 'free'),
    productType,
    isVerified: data.isVerified ?? (productType === 'sticker'),
    emailAlertsEnabled: isPremium ? (data.emailAlertsEnabled ?? false) : true,
    whatsappAlertsEnabled: isPremium ? (data.whatsappAlertsEnabled ?? true) : false,
    bundleId: data.bundleId || null,
    claimedAt: data.claimedAt || null,
  });

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { slug };
}

export async function updateTagStatus(tagId: string, status: 'normal' | 'lost') {
  await requireTagOwnership(tagId);

  await db.update(tags).set({ status }).where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { success: true };
}

export async function updateTagTier(tagId: string, tier: 'free' | 'premium') {
  await requireTagOwnership(tagId);

  await db.update(tags)
    .set({ tier, productType: tier === 'premium' ? 'acrylic' : 'free' })
    .where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { success: true };
}

export async function updateTagVerified(tagId: string, isVerified: boolean) {
  await requireTagOwnership(tagId);

  await db.update(tags).set({ isVerified }).where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { success: true };
}

export async function updateTag(
  tagId: string,
  data: Partial<CreateTagInput> & { tier?: 'free' | 'premium'; isVerified?: boolean }
) {
  const userId = await requireTagOwnership(tagId);

  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, tagId),
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  const nextProductType = data.productType ?? (tag.productType as ProductType | undefined) ?? (tag.tier === 'premium' ? 'acrylic' : 'free');
  const nextTier = data.tier ?? (nextProductType === 'free' ? 'free' : 'premium');
  const isPremium = nextTier === 'premium';

  const isTagFree = tag.productType === 'free';

  const validatedName = data.name ? validateTagName(data.name) : undefined;
  const validatedPhone = data.contactWhatsapp ? validateWhatsAppNumber(data.contactWhatsapp) : undefined;
  const validatedCustomMessage = data.customMessage !== undefined ? validateCustomMessage(data.customMessage) : undefined;
  const validatedRewardNote = (!isTagFree && data.rewardNote !== undefined) ? validateRewardNote(data.rewardNote) : undefined;

  await db.update(tags)
    .set({
      name: validatedName,
      contactWhatsapp: validatedPhone,
      customMessage: validatedCustomMessage,
      rewardNote: validatedRewardNote,
      tier: nextTier,
      productType: nextProductType,
      isVerified: data.isVerified,
      emailAlertsEnabled: isPremium ? (data.emailAlertsEnabled ?? tag.emailAlertsEnabled ?? false) : true,
      whatsappAlertsEnabled: isPremium ? (data.whatsappAlertsEnabled ?? tag.whatsappAlertsEnabled ?? true) : false,
    })
    .where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { success: true };
}

export async function deleteTag(tagId: string) {
  await requireTagOwnership(tagId);

  await db.delete(tags).where(eq(tags.id, tagId));

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  return { success: true };
}

export async function claimTag(tagId: string) {
  const session = await getClaimSession();

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

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  redirect('/dashboard');
}

export async function claimStickerTag(tagId: string, name: string) {
  const session = await getClaimSession();

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

  const [bundle, order] = await Promise.all([
    db.query.tagBundles.findFirst({
      where: eq(tagBundles.id, tag.bundleId),
    }),
    db.query.stickerOrders.findFirst({
      where: eq(stickerOrders.id, tag.bundleId),
    }),
  ]);

  if (!bundle) {
    throw new Error('Bundle sticker tidak ditemukan');
  }

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

  revalidatePath('/dashboard');
  revalidatePath('/p/[slug]');

  redirect('/dashboard');
}
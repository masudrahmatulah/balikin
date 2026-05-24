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

// Validation functions
function validateTagName(name: string): string {
  if (!name || name.trim().length === 0) {
    throw new Error('Nama tag wajib diisi');
  }
  if (name.length > 100) {
    throw new Error('Nama tag maksimal 100 karakter');
  }
  // Allow alphanumeric, spaces, and common punctuation
  if (!/^[a-zA-Z0-9一-鿿ऀ-ॿ\s\-_.,!?@#$%&*()]+$/.test(name)) {
    throw new Error('Nama tag mengandung karakter tidak valid');
  }
  return name.trim();
}

function validateWhatsAppNumber(phone: string): string {
  if (!phone || phone.trim().length === 0) {
    throw new Error('Nomor WhatsApp wajib diisi');
  }
  // Allow Indonesian phone format: +62 or 62 or 0 followed by 9-12 digits
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    throw new Error('Format nomor WhatsApp tidak valid. Gunakan format: +62812XXXXXXX, 62812XXXXXXX, atau 0812XXXXXXX');
  }
  return phone.replace(/\s/g, '');
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
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Validate inputs
  const validatedName = validateTagName(data.name);
  const validatedPhone = validateWhatsAppNumber(data.contactWhatsapp);
  const validatedCustomMessage = validateCustomMessage(data.customMessage);
  const validatedRewardNote = validateRewardNote(data.rewardNote);

  // Sanitize inputs
  const sanitizedName = sanitizeInput(validatedName);
  const sanitizedCustomMessage = validatedCustomMessage ? sanitizeInput(validatedCustomMessage) : null;
  const sanitizedRewardNote = validatedRewardNote ? sanitizeInput(validatedRewardNote) : null;

  // Check free tier limit for users without premium tags
  if (!data.tier || data.tier === 'free') {
    const userTags = await db.query.tags.findMany({
      where: eq(tags.ownerId, session.user.id),
    });

    const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');
    const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;

    if (!hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT) {
      throw new Error(`Batas gratis tercapai. Maksimal ${FREE_TAG_LIMIT} tag untuk pengguna gratis. Silakan upgrade ke premium untuk tag tak terbatas.`);
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
    name: sanitizedName,
    slug,
    ownerId: session.user.id,
    contactWhatsapp: validatedPhone,
    customMessage: sanitizedCustomMessage,
    rewardNote: sanitizedRewardNote,
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

  // Validate and sanitize inputs
  const validatedName = data.name ? validateTagName(data.name) : undefined;
  const validatedPhone = data.contactWhatsapp ? validateWhatsAppNumber(data.contactWhatsapp) : undefined;
  const validatedCustomMessage = data.customMessage !== undefined ? validateCustomMessage(data.customMessage) : undefined;
  const validatedRewardNote = data.rewardNote !== undefined ? validateRewardNote(data.rewardNote) : undefined;

  await db.update(tags)
    .set({
      name: validatedName,
      contactWhatsapp: validatedPhone,
      customMessage: validatedCustomMessage,
      rewardNote: validatedRewardNote,
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

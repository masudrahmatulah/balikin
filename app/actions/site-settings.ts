'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { DEFAULT_TAG_GREETING_TEMPLATE } from '@/lib/site-settings-defaults';

const SETTINGS_ID = 'default';
const MAX_TEMPLATE_LENGTH = 1000;

async function getAdminSessionForAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).role !== 'admin') {
    return null;
  }
  return session;
}

export const getSiteSettings = unstable_cache(
  async () => {
    const row = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, SETTINGS_ID),
    });
    return {
      tagGreetingTemplate: row?.tagGreetingTemplate || DEFAULT_TAG_GREETING_TEMPLATE,
      adminWhatsappNumber: row?.adminWhatsappNumber || null,
    };
  },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
);

export async function updateTagGreetingTemplate(template: string) {
  const trimmed = template.trim();
  if (!trimmed) {
    return { error: 'Template pesan tidak boleh kosong.' };
  }
  if (trimmed.length > MAX_TEMPLATE_LENGTH) {
    return { error: `Template pesan maksimal ${MAX_TEMPLATE_LENGTH} karakter.` };
  }
  return updateSiteSettings({ tagGreetingTemplate: trimmed });
}

export async function updateAdminWhatsappNumber(number: string) {
  const session = await getAdminSessionForAction();
  if (!session) {
    return { error: 'Anda tidak memiliki akses admin.' };
  }
  return updateSiteSettings({ adminWhatsappNumber: number });
}

async function updateSiteSettings(data: { tagGreetingTemplate?: string; adminWhatsappNumber?: string | null }) {
  const session = await getAdminSessionForAction();
  if (!session) {
    return { error: 'Anda tidak memiliki akses admin.' };
  }

  try {
    await db
      .insert(siteSettings)
      .values({ id: SETTINGS_ID, ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...data, updatedAt: new Date() },
      });

    revalidateTag('site-settings');
    revalidatePath('/admin/settings');

    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { error: 'Gagal menyimpan pengaturan. Silakan coba lagi.' };
  }
}

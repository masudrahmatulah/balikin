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
    };
  },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
);

export async function updateTagGreetingTemplate(template: string) {
  const session = await getAdminSessionForAction();
  if (!session) {
    return { error: 'Anda tidak memiliki akses admin.' };
  }

  const trimmed = template.trim();
  if (!trimmed) {
    return { error: 'Template pesan tidak boleh kosong.' };
  }
  if (trimmed.length > MAX_TEMPLATE_LENGTH) {
    return { error: `Template pesan maksimal ${MAX_TEMPLATE_LENGTH} karakter.` };
  }

  try {
    await db
      .insert(siteSettings)
      .values({ id: SETTINGS_ID, tagGreetingTemplate: trimmed, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { tagGreetingTemplate: trimmed, updatedAt: new Date() },
      });

    revalidateTag('site-settings');
    revalidatePath('/admin/settings');
    revalidatePath('/p/[slug]', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error updating tag greeting template:', error);
    return { error: 'Gagal menyimpan pengaturan. Silakan coba lagi.' };
  }
}

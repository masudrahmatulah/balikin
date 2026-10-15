import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { getSession } from '@/lib/session';

interface ActivationPageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = {
  title: 'Aktivasi Barang - Balikin',
  description: 'Aktifkan tag Balikin Anda untuk mulai melindungi barang berharga.',
  robots: 'noindex, nofollow',
};

export default async function ActivationPage({ params }: ActivationPageProps) {
  const { slug } = await params;
  const tag = await db.query.tags.findFirst({
    where: and(eq(tags.slug, slug), eq(tags.app_id, 'balikin_id')),
    columns: { id: true },
  });

  if (!tag) redirect('/');

  const session = await getSession();
  const returnTo = `/claim/${encodeURIComponent(tag.id)}`;
  if (!session) {
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  }

  // Use the canonical claim flow, which validates activation data without
  // putting a PIN in the URL or mutating ownership during page rendering.
  redirect(returnTo);
}

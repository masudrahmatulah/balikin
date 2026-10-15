import { redirect } from 'next/navigation';
import { BatchActivationClient } from '@/components/activation/batch-activation-client';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'Aktivasi Paket - Balikin',
  description: 'Aktifkan tag Balikin dari paket Anda.',
  robots: 'noindex, nofollow',
};

export default async function BatchActivationPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(batchId)) redirect('/');
  const session = await getSession();
  if (!session) {
    const returnTo = `/activate/batch/${batchId}`;
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-amber-50 p-4">
      <BatchActivationClient batchId={batchId} isAuthenticated={!!session} />
    </div>
  );
}

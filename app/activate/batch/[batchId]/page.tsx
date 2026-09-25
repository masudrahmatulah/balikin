import { redirect } from 'next/navigation';
import { BatchActivationClient } from '@/components/activation/batch-activation-client';
import { processBatchActivation } from '@/app/actions/activate';
import { clearActivationSession, getActivationSession, isValidActivationSession } from '@/lib/activation-cookie';
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
  let initialError: string | undefined;

  if (session && await isValidActivationSession()) {
    const activation = await getActivationSession();
    if (activation.batchId === batchId && activation.token) {
      const result = await processBatchActivation(batchId, activation.token);
      if (result.success) {
        redirect(`/dashboard?activatedBatch=${result.claimedCount || 1}`);
      }
      initialError = result.error;
      await clearActivationSession();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-orange-50 to-amber-50 p-4">
      <BatchActivationClient batchId={batchId} isAuthenticated={!!session} initialError={initialError} />
    </div>
  );
}

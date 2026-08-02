import { redirect } from 'next/navigation';
import { setActivationSession, isValidActivationSession } from '@/lib/activation-cookie';
import { checkTagAvailability, processActivation } from '@/app/actions/activate';
import { auth } from '@/lib/auth';
import { ActivationClient } from '@/components/activation/activation-client';

interface ActivationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string; pin?: string }>;
}

export const metadata = {
  title: 'Aktivasi Barang - Balikin',
  description: 'Aktifkan tag Balikin Anda untuk mulai melindungi barang berharga.',
  robots: 'noindex, nofollow',
};

/**
 * Activation Page Entry Point
 * Handles three scenarios:
 * 1. Anonymous user with QR scan → Store cookie, redirect to login
 * 2. Logged-in user with cookie → Auto-activate
 * 3. Logged-in user without cookie → Show activation form
 */
export default async function ActivationPage({ params, searchParams }: ActivationPageProps) {
  const { slug } = await params;
  const { token, pin } = await searchParams;
  const session = await auth.api.getSession({
    headers: new Headers({ cookie: '' }),
  });

  // Check if tag exists and requires activation
  const tagCheck = await checkTagAvailability(slug);

  if (!tagCheck.available) {
    redirect('/dashboard');
  }

  const activationCode = token || pin;

  // Scenario 1: Anonymous user with activation code → Store in cookie and redirect to login
  if (!session && activationCode) {
    await setActivationSession({
      slug,
      token: activationCode,
      redirectAfterLogin: `/activate/${slug}?token=${activationCode}`,
    });

    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(`/activate/${slug}?token=${activationCode}`));
  }

  // Scenario 2: Logged-in user with valid cookie → Auto-activate
  if (session && await isValidActivationSession()) {
    const cookieSession = await (await import('@/lib/activation-cookie')).getActivationSession();

    if (cookieSession.slug === slug && cookieSession.token) {
      const result = await processActivation({
        slug,
        tokenOrPin: cookieSession.token,
      });

      if (result.success) {
        redirect(`/dashboard?activated=${result.serialNumber}`);
      }
    }
  }

  // Scenario 3: Show activation form (for logged-in or manual entry)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <ActivationClient
        slug={slug}
        initialToken={activationCode}
        isAuthenticated={!!session}
        user={session?.user}
      />
    </div>
  );
}

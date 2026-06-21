import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ClaimRequiredClient } from '@/components/activation/claim-required-client';
import { setActivationSession } from '@/lib/activation-cookie';

export const metadata = {
  title: 'Aktivasi Manual - Balikin',
  description: 'Masukkan PIN manual untuk mengaktifkan tag Balikin Anda.',
  robots: 'noindex, nofollow',
};

/**
 * Claim Required Page - PIN Manual Fallback
 * Used when QR Code scan fails or user prefers manual entry
 *
 * Grill Guard 2.1: Stores slug/token in cookie before redirect to auth
 */
export default async function ClaimRequiredPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; token?: string }>;
}) {
  const { slug, token } = await searchParams;
  const session = await auth.api.getSession({
    headers: new Headers({ cookie: '' }),
  });

  // Require slug parameter
  if (!slug) {
    redirect('/dashboard');
  }

  // If user is not authenticated and has token, store in cookie and redirect
  if (!session && token) {
    await setActivationSession({
      slug,
      token,
      redirectAfterLogin: `/claim-required?slug=${slug}&token=${token}`,
    });

    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(`/claim-required?slug=${slug}&token=${token}`));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <ClaimRequiredClient
        slug={slug}
        initialToken={token}
        isAuthenticated={!!session}
        user={session?.user}
      />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface OwnershipDetectorProps {
  isOwner: boolean;
  tagSlug: string;
  autoActivateModule: string | null;
  children: React.ReactNode;
}

/**
 * Client component that redirects owners to their private page
 * while showing the public page to non-owners.
 *
 * This component should be used in the public page to handle
 * smart redirection based on ownership.
 */
export function OwnershipDetector({
  isOwner,
  tagSlug,
  autoActivateModule,
  children,
}: OwnershipDetectorProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOwner) {
      // User owns this tag - redirect to private page
      if (autoActivateModule) {
        // Bundle tag - redirect to specific module
        router.replace(`/p/${tagSlug}/private/${autoActivateModule}`);
      } else {
        // Regular tag - redirect to private tab
        router.replace(`/p/${tagSlug}/private`);
      }
    }
  }, [isOwner, tagSlug, autoActivateModule, router]);

  // While checking or if not owner, show children (public page or loading)
  return <>{children}</>;
}

/**
 * Loading component for ownership detection
 */
export function OwnershipLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-600">Memuat...</p>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { ModuleSpotlightCard } from '@/components/dashboard/module-spotlight-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { Suspense } from 'react';
import { getDashboardData } from './data-access';
import { DashboardStatusBanner } from './dashboard-status-banner';
import { DashboardQuickActions } from './dashboard-quick-actions';
import { DashboardTagList } from './dashboard-tag-list';

interface DashboardPageProps {
  searchParams: Promise<{ limit?: string }>;
}

const DASHBOARD_LOADING_SKELETON = (
  <div className="flex min-h-screen items-center justify-center bg-slate-50" aria-live="polite" aria-busy="true">
    <div className="text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600 mx-auto" />
      <p className="text-slate-600">Memuat dashboard...</p>
    </div>
  </div>
);

async function DashboardContent({ limitReached }: { limitReached?: boolean }) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const data = await getDashboardData(session.user.id);
  const { tags, freeTagCount, lostTagCount, totalScans, hasPremiumTag, hasStudentKit } = data;

  const canCreateMore = freeTagCount < FREE_TAG_LIMIT || hasPremiumTag;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;

  const userEmail = session.user.email ?? 'Pengguna Balikin';
  const tagsWithOwnerEmail = tags.map((tag) => ({
    ...tag,
    ownerEmail: session.user.email ?? null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
        <DashboardStatusBanner totalTags={tags.length} lostTags={lostTagCount} />

        <DashboardQuickActions canCreateMore={canCreateMore} />

        <ModuleSpotlightCard />

        {isAtLimit && (
          <Alert className="mb-6 border-amber-200 bg-amber-50" role="alert">
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <AlertTitle className="text-amber-900">Limit Tercapai</AlertTitle>
            <AlertDescription className="text-amber-800">
              Anda sudah mencapai limit {FREE_TAG_LIMIT} tag gratis.{' '}
              <Link href="/pricing" className="underline font-medium hover:text-amber-900">
                Upgrade untuk lebih banyak tag
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        <DashboardTagList tags={tagsWithOwnerEmail} canCreateMore={canCreateMore} />
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const limitReached = params.limit === '1';

  return (
    <Suspense fallback={DASHBOARD_LOADING_SKELETON}>
      <DashboardContent limitReached={limitReached} />
    </Suspense>
  );
}
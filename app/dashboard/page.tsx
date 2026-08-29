import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { ModuleSpotlightCard } from '@/components/dashboard/module-spotlight-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, ScanLine, ShieldCheck, Sparkles } from 'lucide-react';
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
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" aria-live="polite" aria-busy="true">
    <div className="text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <p className="text-slate-600">Memuat ruang proteksi Anda...</p>
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
  const displayName = session.user.name ?? userEmail.split('@')[0];
  const tagsWithOwnerEmail = tags.map((tag) => ({
    ...tag,
    ownerEmail: session.user.email ?? null,
  }));

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <DashboardHeader userEmail={userEmail} />

      <main className="relative container mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-700/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-40 top-72 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" aria-hidden="true" />

        <section className="relative mb-7 overflow-hidden rounded-3xl border border-blue-100/80 bg-white/75 p-6 shadow-xl shadow-blue-900/5 dark:border-slate-700 dark:bg-slate-900/75 md:p-8">
          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-200/50 to-purple-200/50 blur-3xl dark:from-blue-900/30 dark:to-purple-900/30" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:from-blue-950/60 dark:to-purple-950/60 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Ruang Proteksi Anda
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Selamat datang kembali</p>
              <h1 className="mt-1 text-3xl font-display font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                Halo, <span className="gradient-text">{displayName}</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 md:text-base">
                Kelola semua Smart Tag Anda dari satu tempat. Pastikan setiap barang berharga tetap mudah ditemukan saat dibutuhkan.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={canCreateMore ? '/dashboard/new' : '/pricing'}>
                  <Button className="w-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600 sm:w-auto">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    {canCreateMore ? 'Lindungi Barang Baru' : 'Upgrade Proteksi'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Button asChild variant="outline" className="w-full border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-800/70 dark:text-blue-300 dark:hover:bg-slate-700 sm:w-auto">
                  <Link href="#tags">Lihat Smart Tag</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-2 dark:border-slate-700 dark:bg-slate-800/70 sm:max-w-sm sm:gap-3 sm:p-3">
              <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-slate-900/70">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{tags.length}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 sm:text-xs">Tag Aktif</p>
              </div>
              <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-slate-900/70">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{totalScans}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 sm:text-xs"><ScanLine className="h-3 w-3" aria-hidden="true" /> Scan</p>
              </div>
              <div className="rounded-xl bg-white/80 p-3 text-center dark:bg-slate-900/70">
                <p className="text-2xl font-bold text-orange-500">{hasPremiumTag ? 'Pro' : 'Free'}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500 sm:text-xs">Paket Anda</p>
              </div>
            </div>
          </div>
        </section>

        <DashboardStatusBanner totalTags={tags.length} lostTags={lostTagCount} />

        <DashboardQuickActions canCreateMore={canCreateMore} />

        <ModuleSpotlightCard />

        {isAtLimit && (
          <Alert className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/20" role="alert">
            <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
            <AlertTitle className="text-amber-900 dark:text-amber-200">Limit Tercapai</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Anda sudah mencapai limit {FREE_TAG_LIMIT} tag gratis.{' '}
              <Link href="/pricing" className="underline font-medium hover:text-amber-900">
                Upgrade untuk lebih banyak tag
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        <DashboardTagList tags={tagsWithOwnerEmail} canCreateMore={canCreateMore} />
      </main>
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

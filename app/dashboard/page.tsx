import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs, userModuleSelections, userModulePermissions, moduleRequests } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { TagCard } from '@/components/tag-card';
import { ModuleCard } from '@/components/module-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  QrCode,
  Plus,
  AlertCircle,
  ShieldCheck,
  ScanLine,
} from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { Suspense } from 'react';
import { SignOutButton } from '@/components/sign-out-button';
import { getAllModules } from '@/lib/admin-modules';
import { getEnabledModulesForUser as fetchEnabledModules } from '@/app/actions/admin-module-actions';
import { getUserPendingRequests as fetchPendingRequests } from '@/app/actions/module-request-actions';
import { RequestHistoryWrapper } from '@/components/request-history-wrapper';

interface DashboardPageProps {
  searchParams: Promise<{ limit?: string }>;
}

async function DashboardContent({ limitReached }: { limitReached?: boolean }) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, session.user.id),
    orderBy: (tags, { desc }) => [desc(tags.createdAt)],
  });

  // Get scan count for each tag and check if has Student Kit module
  const tagsWithScanCount = await Promise.all(
    userTags.map(async (tag) => {
      const scanResult = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(eq(scanLogs.tagId, tag.id));

      // Check if user has Student Kit module enabled
      const studentKitModule = await db.query.userModuleSelections.findFirst({
        where: and(
          eq(userModuleSelections.userId, session.user.id),
          eq(userModuleSelections.moduleType, 'student'),
          eq(userModuleSelections.isActive, true)
        ),
      });

      return {
        ...tag,
        scanCount: scanResult[0]?.count || 0,
        ownerEmail: session.user.email ?? null,
        hasStudentKit: !!studentKitModule,
      };
    })
  );

  // Count free tags
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');
  const canCreateMore = freeTagCount < FREE_TAG_LIMIT || hasPremiumTag;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;
  const lostTagCount = userTags.filter(tag => tag.status === 'lost').length;
  const totalScans = tagsWithScanCount.reduce((sum, tag) => sum + tag.scanCount, 0);
  const userEmail = session.user.email ?? 'Pengguna Balikin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <h1 className="text-lg font-semibold text-slate-950">Balikin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 md:inline">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-10">
        {/* Hero Section - Status Aman/Hilang */}
        <section className="mb-8">
          <Card className={`border-2 ${lostTagCount > 0 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'} shadow-lg`}>
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg">
                {lostTagCount > 0 ? (
                  <AlertCircle className="h-12 w-12 text-rose-500" />
                ) : (
                  <ShieldCheck className="h-12 w-12 text-emerald-500" />
                )}
              </div>
              <h2 className={`text-3xl font-bold ${lostTagCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {lostTagCount > 0 ? `${lostTagCount} Tag Hilang` : 'SEMUA AMAN'}
              </h2>
              <p className="mt-2 text-slate-600">
                {lostTagCount > 0
                  ? 'Segera cek tag yang hilang untuk memantau aktivitas scan'
                  : 'Tidak ada tag yang hilang saat ini'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{userTags.length}</p>
                  <p className="text-sm text-slate-600">Tag Aktif</p>
                </div>
                <div className="h-12 w-px bg-slate-300"></div>
                <div>
                  <p className={`text-2xl font-bold ${lostTagCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{lostTagCount}</p>
                  <p className="text-sm text-slate-600">Tag Hilang</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <Link href="/dashboard/new" className={canCreateMore ? '' : 'pointer-events-none opacity-50'}>
            <Card className={`h-full border-2 transition-all ${canCreateMore ? 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md' : 'border-slate-200 bg-slate-100'}`}>
              <CardContent className="flex h-full items-center gap-4 p-6">
                <div className="rounded-xl bg-blue-600 p-3 text-white">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">Tambah Tag Baru</p>
                  <p className="text-sm text-slate-600">Buat tag untuk barang Anda</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="#tags">
            <Card className="h-full border-2 border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-md">
              <CardContent className="flex h-full items-center gap-4 p-6">
                <div className="rounded-xl bg-slate-700 p-3 text-white">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-lg">Lihat Semua Tag</p>
                  <p className="text-sm text-slate-600">Kelola tag yang ada</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Module List */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Modul Tersedia</h2>
            <span className="text-sm text-slate-600">
              Upgrade akun Anda untuk mengakses lebih banyak modul
            </span>
          </div>
          <ModulesListWrapper userId={session.user.id} />
        </section>

        {/* Request History */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Riwayat Permintaan Modul
          </h2>
          <RequestHistorySection userId={session.user.id} />
        </section>

        {/* Recent Activity */}
        {totalScans > 0 && (
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Aktivitas Terbaru</h3>
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {tagsWithScanCount
                    .filter(tag => tag.scanCount > 0)
                    .slice(0, 5)
                    .map(tag => (
                      <div key={tag.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div className="rounded-full bg-blue-100 p-2">
                          <ScanLine className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{tag.name || 'Tanpa Nama'}</p>
                          <p className="text-sm text-slate-600">Discan {tag.scanCount} kali</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {(isAtLimit || limitReached) && (
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Limit Tercapai</AlertTitle>
            <AlertDescription className="text-amber-800">
              Anda sudah mencapai limit {FREE_TAG_LIMIT} tag gratis. Upgrade untuk lebih banyak tag.
            </AlertDescription>
          </Alert>
        )}

        {/* Tag List */}
        <section id="tags">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Tag Saya</h3>
            <Link href="/dashboard/new">
              <Button disabled={!canCreateMore} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </Button>
            </Link>
          </div>

          {tagsWithScanCount.length === 0 ? (
            <Card className="border border-slate-200 bg-white">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <QrCode className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Belum Ada Tag</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Buat tag pertama Anda untuk melindungi barang berharga
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tagsWithScanCount.map((tag) => (
                <TagCard key={tag.id} {...tag} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Module List Wrapper Component
async function ModulesListWrapper({ userId }: { userId: string }) {
  const allModules = getAllModules();
  const enabledModules = await fetchEnabledModules(userId);
  const pendingRequests = await fetchPendingRequests();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {allModules.map((module) => (
        <ModuleCard
          key={module.type}
          moduleType={module.type}
          isEnabled={enabledModules.includes(module.type)}
          hasPendingRequest={pendingRequests.includes(module.type)}
          onModuleAccess={(moduleType) => {
            // Navigate to module-specific page
            // For now, just show alert
            alert(`Modul ${moduleType} akan segera tersedia!`);
          }}
        />
      ))}
    </div>
  );
}

// Request History Wrapper Component
async function RequestHistorySection({ userId }: { userId: string }) {
  return <RequestHistoryWrapper userId={userId} />;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const limitReached = params.limit === '1';

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50">Loading...</div>}>
      <DashboardContent limitReached={limitReached} />
    </Suspense>
  );
}

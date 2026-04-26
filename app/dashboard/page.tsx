import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs, userModuleSelections } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { TagCard } from '@/components/tag-card';
import { DashboardHeader } from '@/components/dashboard-header';
import { QuickActionCard } from '@/components/quick-action-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  QrCode,
  Plus,
  AlertCircle,
  ShieldCheck,
  ScanLine,
  Package,
  Activity,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { Suspense } from 'react';

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
      {/* Compact Header */}
      <DashboardHeader userEmail={userEmail} />

      <div className="container mx-auto max-w-5xl px-4 py-6 md:py-8">
        {/* Compact Hero Section - Status Banner */}
        <section className="mb-6">
          <Card
            className={`border-2 overflow-hidden ${
              lostTagCount > 0
                ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white shadow-rose-100/50'
                : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-emerald-100/50'
            } shadow-lg`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${
                      lostTagCount > 0
                        ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    }`}
                  >
                    {lostTagCount > 0 ? (
                      <AlertCircle className="h-7 w-7 text-white" />
                    ) : (
                      <ShieldCheck className="h-7 w-7 text-white" />
                    )}
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold md:text-2xl ${
                        lostTagCount > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {lostTagCount > 0 ? `${lostTagCount} Tag Hilang` : 'SEMUA AMAN'}
                    </h2>
                    <p className="text-sm text-slate-600 md:text-base">
                      {lostTagCount > 0
                        ? 'Segera cek tag yang hilang'
                        : 'Tidak ada tag yang hilang saat ini'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{userTags.length}</p>
                    <p className="text-xs text-slate-500 md:text-sm">Tag Aktif</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${lostTagCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {lostTagCount}
                    </p>
                    <p className="text-xs text-slate-500 md:text-sm">Hilang</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Grid - 2x2 */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Tambah Tag"
            description="Buat tag baru untuk barang Anda"
            icon={Plus}
            href="/dashboard/new"
            color="blue"
            disabled={!canCreateMore}
          />
          <QuickActionCard
            title="Lihat Tag"
            description="Kelola semua tag Anda"
            icon={Package}
            href="#tags"
            color="emerald"
          />
          <QuickActionCard
            title="Scan QR"
            description="Simulasi scan untuk testing"
            icon={ScanLine}
            href="/scan"
            color="purple"
          />
          <QuickActionCard
            title="Bantuan"
            description="Panduan dan FAQ"
            icon={HelpCircle}
            href="/help"
            color="slate"
          />
        </section>

        {/* Limit Alert */}
        {(isAtLimit || limitReached) && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
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

        {/* Tag List Section */}
        <section id="tags" className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Tag Saya</h3>
            <Link href="/dashboard/new">
              <Button disabled={!canCreateMore} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Tag</span>
                <span className="sm:hidden">Tambah</span>
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
                <Link href="/dashboard/new" className="mt-4 inline-block">
                  <Button size="sm">Buat Tag Sekarang</Button>
                </Link>
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

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const limitReached = params.limit === '1';

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50">Loading...</div>}>
      <DashboardContent limitReached={limitReached} />
    </Suspense>
  );
}

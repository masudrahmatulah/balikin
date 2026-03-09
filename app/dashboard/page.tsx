import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { TagCard } from '@/components/tag-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, Plus, LogOut, Crown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { UpsellBanner } from '@/components/upsell-banner';
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

  // Get scan count for each tag
  const tagsWithScanCount = await Promise.all(
    userTags.map(async (tag) => {
      const scanResult = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(eq(scanLogs.tagId, tag.id));

      return {
        ...tag,
        scanCount: scanResult[0]?.count || 0,
      };
    })
  );

  // Check if user has any premium tags
  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');

  // Count free tags
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const isFreeUser = !hasPremiumTag && freeTagCount > 0;
  const canCreateMore = freeTagCount < FREE_TAG_LIMIT || hasPremiumTag;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;

  const handleSignOut = async () => {
    'use server';
    redirect('/sign-out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Balikin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.email}
            </span>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upsell Banner for Free Users */}
        {isFreeUser && <UpsellBanner variant="dashboard" />}

        {/* Limit Reached Alert */}
        {(isAtLimit || limitReached) && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Limit Free User Tercapai</AlertTitle>
            <AlertDescription className="text-amber-700">
              Anda telah mencapai batas {FREE_TAG_LIMIT} tag untuk pengguna gratis.
              Upgrade ke Premium untuk membuat tag tanpa batas dan dapatkan gantungan kunci fisik.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tag Saya</h2>
            <p className="text-gray-600">
              {userTags.length} tag terdaftar
              {isFreeUser && (
                <span className="text-amber-600 ml-2">
                  ({freeTagCount}/{FREE_TAG_LIMIT} gratis)
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button disabled={!canCreateMore}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tag
            </Button>
          </Link>
        </div>

        {/* Tags List */}
        {tagsWithScanCount.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada tag
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat tag pertama Anda
              </p>
              <Link href="/dashboard/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Tag Baru
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {tagsWithScanCount.map((tag) => (
              <TagCard key={tag.id} {...tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const limitReached = params.limit === '1';

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <DashboardContent limitReached={limitReached} />
    </Suspense>
  );
}

  const userTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, session.user.id),
    orderBy: (tags, { desc }) => [desc(tags.createdAt)],
  });

  // Get scan count for each tag
  const tagsWithScanCount = await Promise.all(
    userTags.map(async (tag) => {
      const scanResult = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(eq(scanLogs.tagId, tag.id));

      return {
        ...tag,
        scanCount: scanResult[0]?.count || 0,
      };
    })
  );

  // Check if user has any premium tags
  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');

  // Count free tags
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const isFreeUser = !hasPremiumTag && freeTagCount > 0;
  const canCreateMore = freeTagCount < FREE_TAG_LIMIT || hasPremiumTag;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;

  const handleSignOut = async () => {
    'use server';
    redirect('/sign-out');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Balikin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.email}
            </span>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upsell Banner for Free Users */}
        {isFreeUser && <UpsellBanner variant="dashboard" />}

        {/* Limit Reached Alert */}
        {isAtLimit && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Limit Free User Tercapai</AlertTitle>
            <AlertDescription className="text-amber-700">
              Anda telah mencapai batas {FREE_TAG_LIMIT} tag untuk pengguna gratis.
              Upgrade ke Premium untuk membuat tag tanpa batas dan dapatkan gantungan kunci fisik.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tag Saya</h2>
            <p className="text-gray-600">
              {userTags.length} tag terdaftar
              {isFreeUser && (
                <span className="text-amber-600 ml-2">
                  ({freeTagCount}/{FREE_TAG_LIMIT} gratis)
                </span>
              )}
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button disabled={!canCreateMore}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tag
            </Button>
          </Link>
        </div>

        {/* Tags List */}
        {tagsWithScanCount.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada tag
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat tag pertama Anda
              </p>
              <Link href="/dashboard/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Tag Baru
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1">
            {tagsWithScanCount.map((tag) => (
              <TagCard key={tag.id} {...tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

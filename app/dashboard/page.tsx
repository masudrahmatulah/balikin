import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { TagCard } from '@/components/tag-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export default async function DashboardPage() {
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
        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Tag Saya</h2>
            <p className="text-gray-600">
              {userTags.length} tag terdaftar
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button>
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

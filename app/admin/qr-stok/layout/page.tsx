import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { AdminHeader } from '@/components/admin/admin-header';
import { QRLayoutEditorClient } from '@/components/admin/qr-layout-editor-client';

export default async function QRLayoutPage(props: any) {
  const searchParams = props.searchParams as { tags?: string } | undefined;
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/qr-stok/layout');
  }

  // Parse tag IDs from URL
  const tagIdsParam = searchParams?.tags;
  if (!tagIdsParam) {
    // No tags specified, redirect back to QR stok page
    redirect('/admin/qr-stok');
  }

  const tagIds = tagIdsParam.split(',').filter(id => id.length > 0);

  if (tagIds.length === 0) {
    redirect('/admin/qr-stok');
  }

  // Fetch tags by IDs
  const fetchedTags = await db.query.tags.findMany({
    where: inArray(tags.id, tagIds),
  });

  if (fetchedTags.length === 0) {
    redirect('/admin/qr-stok');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Layout QR Stok - Gantungan Akrilik
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Atur posisi QR codes secara visual sebelum dicetak ke kertas A4.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/qr-stok">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Kembali ke QR Stok
              </button>
            </Link>
          </div>
        </div>

        <QRLayoutEditorClient initialTags={fetchedTags} />
      </main>
    </div>
  );
}

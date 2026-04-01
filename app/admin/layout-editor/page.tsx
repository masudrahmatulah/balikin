import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { AdminHeader } from '@/components/admin/admin-header';
import { LayoutEditorClient } from './layout-editor-client';

export default async function LayoutEditorPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/layout-editor');
  }

  // Fetch all tags for the editor
  const allTags = await db.query.tags.findMany({
    orderBy: [desc(tags.createdAt)],
    limit: 100,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Layout Editor Sticker</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Atur posisi sticker secara visual sebelum dicetak ke PDF.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/sticker-orders">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Kembali ke Orders
              </button>
            </Link>
          </div>
        </div>

        <LayoutEditorClient availableTags={allTags} />
      </main>
    </div>
  );
}

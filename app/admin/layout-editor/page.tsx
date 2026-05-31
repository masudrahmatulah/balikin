import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';

// TODO: Fix layout editor - temporarily disabled due to build issues
export default async function LayoutEditorPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/layout-editor');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <main className="container mx-auto max-w-7xl px-4 py-8" role="main">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Layout Editor Sticker
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Coming Soon - Fitur ini sedang dalam perbaikan.
            </p>
          </div>
          <nav aria-label="Admin Navigation">
            <Link href="/admin/sticker-orders">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Kembali ke halaman order stiker"
              >
                Kembali ke Orders
              </button>
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}

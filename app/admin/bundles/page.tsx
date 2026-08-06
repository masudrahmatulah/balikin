import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminCard } from '@/components/admin/admin-card';
import { BundleCard } from '@/components/admin/bundle-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getBundlePageData, getBundleCountByType } from './data-access';

const BUNDLE_TYPES = [
  { key: 'student_kit', title: 'Student Kit', emoji: '🎓', color: 'blue' as const },
  { key: 'otomotif', title: 'Otomotif', emoji: '🚗', color: 'red' as const },
  { key: 'pertanian', title: 'Pertanian', emoji: '🌾', color: 'green' as const },
  { key: 'diklat', title: 'Diklat', emoji: '👥', color: 'purple' as const },
] as const;

const COLOR_CLASSES = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  purple: 'bg-purple-50 border-purple-200 text-purple-900',
} as const;

export default async function AdminBundlesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/sign-in');
  }

  const { bundleStats, recentBundles } = await getBundlePageData();

  return (
    <AdminLayout
      title="Manage Bundles"
      description="Kelola bundle produk dan generate QR code"
    >
      {/* Header Actions */}
      <div className="flex justify-end mb-8">
        <Link href="/admin/bundles/new">
          <Button className="gap-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Bundle
          </Button>
        </Link>
      </div>

      {/* Bundle Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-label="Bundle Statistics">
        {BUNDLE_TYPES.map(({ key, title, emoji, color }) => (
          <div
            key={key}
            className={`border rounded-lg p-4 ${COLOR_CLASSES[color]}`}
            role="region"
            aria-label={`${title} Bundle`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-3xl font-bold mt-1" aria-label={`${getBundleCountByType(bundleStats, key)} ${title} bundles`}>
                  {getBundleCountByType(bundleStats, key)}
                </p>
              </div>
              <span className="text-4xl" aria-hidden="true">{emoji}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Bundles */}
      <section aria-labelledby="recent-bundles-heading">
        <h2 id="recent-bundles-heading" className="text-2xl font-bold text-gray-900 mb-4">
          Recent Bundle Tags
        </h2>
      </section>

      {recentBundles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {recentBundles.map((tag) => (
            <BundleCard key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <AdminCard className="text-center py-12">
          <p className="text-gray-500 mb-4">Belum ada bundle tags yang dibuat.</p>
          <Link href="/admin/bundles/new">
            <Button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              Create First Bundle
            </Button>
          </Link>
        </AdminCard>
      )}
    </AdminLayout>
  );
}
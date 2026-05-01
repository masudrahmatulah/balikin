import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { count, sql, desc } from 'drizzle-orm';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminCard } from '@/components/admin/admin-card';
import { BundleCard } from '@/components/admin/bundle-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminBundlesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/sign-in');
  }

  // Get bundle statistics
  const bundleStats = await db
    .select({
      bundleType: tags.bundleType,
      count: count(),
    })
    .from(tags)
    .where(sql`${tags.bundleType} IS NOT NULL`)
    .groupBy(tags.bundleType);

  // Get recent bundle tags
  const recentBundles = await db.query.tags.findMany({
    where: sql`${tags.bundleType} IS NOT NULL`,
    orderBy: [desc(tags.createdAt)],
    limit: 10,
  });

  return (
    <AdminLayout
      title="Manage Bundles"
      description="Kelola bundle produk dan generate QR code"
      header={<AdminHeader session={session} />}
    >
      {/* Header Actions */}
      <div className="flex justify-end mb-8">
        <Link href="/admin/bundles/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Bundle
          </Button>
        </Link>
      </div>

      {/* Bundle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <BundleStatCard
          title="Student Kit"
          emoji="🎓"
          count={bundleStats.find(s => s.bundleType === 'student_kit')?.count || 0}
          color="blue"
        />
        <BundleStatCard
          title="Otomotif"
          emoji="🚗"
          count={bundleStats.find(s => s.bundleType === 'otomotif')?.count || 0}
          color="red"
        />
        <BundleStatCard
          title="Pertanian"
          emoji="🌾"
          count={bundleStats.find(s => s.bundleType === 'pertanian')?.count || 0}
          color="green"
        />
        <BundleStatCard
          title="Diklat"
          emoji="👥"
          count={bundleStats.find(s => s.bundleType === 'diklat')?.count || 0}
          color="purple"
        />
      </div>

      {/* Recent Bundles */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recent Bundle Tags
        </h2>
      </div>

      {recentBundles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentBundles.map((tag) => (
            <BundleCard key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <AdminCard className="text-center py-12">
          <p className="text-gray-500 mb-4">Belum ada bundle tags yang dibuat.</p>
          <Link href="/admin/bundles/new">
            <Button>Create First Bundle</Button>
          </Link>
        </AdminCard>
      )}
    </AdminLayout>
  );
}

function BundleStatCard({
  title,
  emoji,
  count,
  color,
}: {
  title: string;
  emoji: string;
  count: number;
  color: 'blue' | 'red' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{count}</p>
        </div>
        <span className="text-4xl">{emoji}</span>
      </div>
    </div>
  );
}

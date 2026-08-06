import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { AdminLayout } from '@/components/admin/admin-layout';
import { BundleCreateForm } from '@/components/admin/bundle-create-form';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create Bundle - Admin',
  description: 'Generate QR codes for bundle products',
};

export default async function NewBundlePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/sign-in');
  }

  // Get existing bundle count for this batch
  const existingBundles = await db.query.tags.findMany({
    where: (tags, { sql }) => sql`${tags.bundleType} IS NOT NULL`,
    columns: {
      bundleType: true,
    },
  });

  const bundleCount = existingBundles.length;

  return (
    <AdminLayout
      title="Generate Bundle QR Codes"
      description="Buat QR codes untuk produk bundle (Student Kit, Otomotif, dll)"
    >
      {/* Form */}
      <BundleCreateForm existingCount={bundleCount} />
    </AdminLayout>
  );
}

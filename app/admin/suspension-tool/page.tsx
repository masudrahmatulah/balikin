import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getSuspensions, getSuspensionStats } from './data-access';
import { SuspensionToolTable } from '@/components/admin/suspension-tool-table';

export default async function SuspensionToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/suspension-tool');
  }

  const [suspensions, stats] = await Promise.all([
    getSuspensions(1),
    getSuspensionStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Suspension Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage user suspensions by User ID or Device ID
        </p>
      </div>

      <SuspensionToolTable suspensions={suspensions} stats={stats} adminId={session.user.id} />
    </div>
  );
}
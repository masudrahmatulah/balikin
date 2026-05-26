import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getPrintQueueItems, getPrintQueueStats } from './data-access';
import { PrintQueueTable } from '@/components/admin/print-queue-table';

export default async function PrintQueuePage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/print-queue');
  }

  const [queueItems, stats] = await Promise.all([
    getPrintQueueItems(1),
    getPrintQueueStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Print Queue
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage batch printing jobs and track production status
        </p>
      </div>

      <PrintQueueTable items={queueItems} stats={stats} adminId={session.user.id} />
    </div>
  );
}
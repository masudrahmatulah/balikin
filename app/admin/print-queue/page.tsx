import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getPrintQueueItems, getPrintQueueItemsCount, getPrintQueueStats } from './data-access';
import { PrintQueueTable } from '@/components/admin/print-queue-table';

const PRINT_QUEUE_ITEMS_PER_PAGE = 25;

export default async function PrintQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/print-queue');
  }

  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam || '1', 10);
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [totalItems, stats] = await Promise.all([
    getPrintQueueItemsCount(),
    getPrintQueueStats(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalItems / PRINT_QUEUE_ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const queueItems = await getPrintQueueItems(safePage);

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

      <PrintQueueTable
        items={queueItems}
        stats={stats}
        adminId={session.user.id}
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={totalItems}
      />
    </div>
  );
}

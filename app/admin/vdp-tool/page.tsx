import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getVDPTagStats, getVDPPrintQueueStats, getVDPRecentBatches } from './data-access';
import { BulkGenerationSection } from '@/components/admin/vdp-tool/bulk-generation-section';
import { QuickActionsBar } from '@/components/admin/vdp-tool/quick-actions-bar';

export default async function VDPToolPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/vdp-tool');
  }

  const [tagStats, printQueueStats, recentBatches] = await Promise.all([
    getVDPTagStats(),
    getVDPPrintQueueStats(),
    getVDPRecentBatches(),
  ]);

  return (
    <main className="space-y-8">
      <BulkGenerationSection adminId={session.user.id} tagStats={tagStats} />
      <QuickActionsBar printQueueStats={printQueueStats} />
    </main>
  );
}
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { MarketingDashboard } from '@/components/admin/marketing-dashboard';
import { LostFoundSuccessRate, LostFoundSuccessRateSkeleton } from '@/components/admin/analytics/lost-found-success-rate';
import { GeoScanHeatmap, GeoScanHeatmapSkeleton } from '@/components/admin/analytics/geo-scan-heatmap';
import { BatchActivationMetrics, BatchActivationMetricsSkeleton } from '@/components/admin/analytics/batch-activation-metrics';

const VALID_TABS = ['conversion', 'recovery-geo', 'bundles'] as const;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/analytics');
  }

  const requestedTab = searchParams?.tab;
  const activeTab = requestedTab && (VALID_TABS as readonly string[]).includes(requestedTab)
    ? requestedTab
    : 'conversion';

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Strategic Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          High-signal visualizations for growth and business decisions
        </p>
      </header>

      {activeTab === 'conversion' && <MarketingDashboard embedded />}

      {activeTab === 'recovery-geo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LostFoundSuccessRate />
          <GeoScanHeatmap />
        </div>
      )}

      {activeTab === 'bundles' && <BatchActivationMetrics />}
    </div>
  );
}

export function AdminAnalyticsPageLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="h-7 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      </header>

      <div className="space-y-4">
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LostFoundSuccessRateSkeleton />
          <GeoScanHeatmapSkeleton />
        </div>
        <BatchActivationMetricsSkeleton />
      </div>
    </div>
  );
}

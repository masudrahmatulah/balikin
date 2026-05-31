import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { MarketingDashboard } from '@/components/admin/marketing-dashboard';
import { LostFoundSuccessRate, LostFoundSuccessRateSkeleton } from '@/components/admin/analytics/lost-found-success-rate';
import { GeoScanHeatmap, GeoScanHeatmapSkeleton } from '@/components/admin/analytics/geo-scan-heatmap';
import { BatchActivationMetrics, BatchActivationMetricsSkeleton } from '@/components/admin/analytics/batch-activation-metrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/analytics');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Strategic insights and business metrics
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="Analytics tabs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="recovery">Recovery</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6" role="tabpanel">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-600 rounded-full" aria-hidden="true"></span>
              Strategic Analytics Overview
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LostFoundSuccessRate />
              <GeoScanHeatmap />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6" role="tabpanel">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-green-600 rounded-full" aria-hidden="true"></span>
              Conversion Funnel
            </h2>
            <MarketingDashboard />
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-6" role="tabpanel">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 rounded-full" aria-hidden="true"></span>
              Lost & Found Success Rate
            </h2>
            <LostFoundSuccessRate />
          </div>
        </TabsContent>

        <TabsContent value="bundles" className="space-y-6" role="tabpanel">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-600 rounded-full" aria-hidden="true"></span>
              Batch Activation Metrics
            </h2>
            <BatchActivationMetrics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminAnalyticsPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mt-2" />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LostFoundSuccessRateSkeleton />
            <GeoScanHeatmapSkeleton />
            <BatchActivationMetricsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
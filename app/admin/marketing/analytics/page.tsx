import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { MarketingDashboard } from "@/components/admin/marketing-dashboard";
import { LostFoundSuccessRate, LostFoundSuccessRateSkeleton } from "@/components/admin/analytics/lost-found-success-rate";
import { GeoScanHeatmap, GeoScanHeatmapSkeleton } from "@/components/admin/analytics/geo-scan-heatmap";
import { BatchActivationMetrics, BatchActivationMetricsSkeleton } from "@/components/admin/analytics/batch-activation-metrics";
import { DivisionGuard } from "@/components/admin/wrappers/division-guard";

export const dynamic = "force-dynamic";

export default async function MarketingAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/marketing/analytics");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track conversions, recovery rates, and activation metrics
        </p>
      </div>

      {/* Strategic Analytics Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
            Strategic Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lost & Found Success Rate - Customer Service, Marketing & Admin */}
            <DivisionGuard permission="lost_found_success_rate" showMessage={false}>
              <LostFoundSuccessRate />
            </DivisionGuard>

            {/* Geospatial Scan Heatmap - Marketing & Admin */}
            <DivisionGuard permission="geo_scan_heatmap" showMessage={false}>
              <GeoScanHeatmap />
            </DivisionGuard>

            {/* Batch Activation Metrics - Customer Service & Admin */}
            <DivisionGuard permission="batch_activation_metrics" showMessage={false}>
              <BatchActivationMetrics />
            </DivisionGuard>
          </div>
        </div>

        {/* Conversion Funnel & Module Performance */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-600 rounded-full"></span>
            Conversion & Performance
          </h2>
          <DivisionGuard permission="conversion_funnel" showMessage={false}>
            <MarketingDashboard />
          </DivisionGuard>
        </div>
      </div>
    </div>
  );
}

// Loading state
export function MarketingAnalyticsPageLoading() {
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

        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
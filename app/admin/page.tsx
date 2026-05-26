import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { CriticalAlerts } from "@/components/admin/critical-alerts";
import { ManufacturingQueueMetrics, ManufacturingQueueMetricsSkeleton } from "@/components/admin/overview/manufacturing-queue-metrics";
import { VdpBatchDownload, VdpBatchDownloadSkeleton } from "@/components/admin/overview/vdp-batch-download";
import { SystemHealthMonitor, SystemHealthMonitorSkeleton } from "@/components/admin/overview/system-health-monitor";
import { VerificationQueue, VerificationQueueSkeleton } from "@/components/admin/overview/verification-queue";
import {
  DashboardStatsSkeleton,
  ActivityFeedSkeleton,
  CriticalAlertsSkeleton,
} from "@/components/admin/skeletons";
import { getDashboardStatsServer, getPendingCountsServer, getRecentTagsServer } from "./data-access";
import { Download, Search } from "lucide-react";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Fetch dashboard data in parallel with error resilience
  const [dashboardStats, pendingCounts, recentTags] = await Promise.allSettled([
    getDashboardStatsServer(),
    getPendingCountsServer(),
    getRecentTagsServer(4),
  ]);

  const stats = dashboardStats.status === "fulfilled" ? dashboardStats.value : {
    totalUsers: 0,
    totalTags: 0,
    totalOrders: 0,
    lostTags: 0,
    revenue: {
      daily: { total: 0, count: 0, period: "daily" },
      monthly: { total: 0, count: 0, period: "monthly" },
    },
    materials: { total: 0, lowStockCount: 0, lowStockItems: [] },
  };

  const recentTagsData = recentTags.status === "fulfilled" ? recentTags.value : [];

  return (
    <div className="space-y-6" role="main" aria-label="Admin Dashboard">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time metrics and operational controls
          </p>
        </div>
        <nav className="flex gap-3" aria-label="Dashboard actions">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            aria-label="Search dashboard"
            type="button"
          >
            <Search size={16} aria-hidden="true" />
            <span>Search</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-colors"
            aria-label="Export dashboard data as CSV"
            type="button"
          >
            <Download size={16} aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </nav>
      </header>

      {/* Dashboard Stats */}
      <section aria-label="Key Metrics">
        <DashboardStats
          totalUsers={stats.totalUsers}
          totalTags={stats.totalTags}
          lostTags={stats.lostTags}
          revenue={stats.revenue}
          materials={stats.materials}
        />
      </section>

      {/* Operational Overview Section */}
      <section aria-labelledby="operational-overview-heading">
        <h2 id="operational-overview-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" aria-hidden="true"></span>
          Operational Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Manufacturing Queue - Production & Admin */}
          <ManufacturingQueueMetrics />

          {/* VDP Batch Download - Production & Admin */}
          <VdpBatchDownload />

          {/* System Health Monitor - Production & Admin */}
          <SystemHealthMonitor />

          {/* Verification Queue - Customer Service & Admin */}
          <VerificationQueue />
        </div>
      </section>

      {/* Dashboard Body - Main Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Recent Activity">
          <ActivityFeed />
        </section>
        <section aria-label="Critical Alerts">
          <CriticalAlerts
            materials={stats.materials.lowStockItems?.map(m => ({ name: m.materialType, quantity: m.quantity }))}
            recentTags={recentTagsData}
          />
        </section>
      </div>
    </div>
  );
}

// Loading state component for hydration
export const AdminPageLoading = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-10 w-32 bg-blue-600 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Skeleton Stats */}
      <DashboardStatsSkeleton />

      {/* Operational Overview Skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ManufacturingQueueMetricsSkeleton />
          <VdpBatchDownloadSkeleton />
          <SystemHealthMonitorSkeleton />
          <VerificationQueueSkeleton />
        </div>
      </div>

      {/* Skeleton Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeedSkeleton />
        <CriticalAlertsSkeleton />
      </div>
    </div>
  );
};
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
import { getDashboardStatsServer, getRecentTagsServer, getRecentActivityServer } from "./data-access";
import { Search } from "lucide-react";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Fetch dashboard data in parallel with error resilience
  const [dashboardStats, recentTags, recentActivity] = await Promise.allSettled([
    getDashboardStatsServer(),
    getRecentTagsServer(4),
    getRecentActivityServer(8),
  ]);

  const dbConnected = dashboardStats.status === "fulfilled";

  const stats = dashboardStats.status === "fulfilled" ? dashboardStats.value : {
    totalUsers: 0,
    totalTags: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lostTags: 0,
    premiumTags: 0,
    exactTagsCount: 0,
    revenue: {
      daily: { total: 0, count: 0, period: "daily" },
      monthly: { total: 0, count: 0, period: "monthly" },
    },
    materials: { total: 0, lowStockCount: 0, lowStockItems: [] },
    dailyOrdersSeries: [0, 0, 0, 0, 0, 0, 0],
    tagDistribution: [] as Array<{ label: string; percent: number }>,
    production: { total: 0, completed: 0, pending: 0 },
  };

  const recentTagsData = recentTags.status === "fulfilled" ? recentTags.value : [];
  const activityData = recentActivity.status === "fulfilled" ? recentActivity.value : [];

  return (
    <div className="space-y-8" role="main" aria-label="Admin Dashboard">
      {/* Page Header */}
      <header className="relative overflow-hidden rounded-3xl border border-blue-100/80 bg-white/70 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-700/10" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:from-blue-950/60 dark:to-purple-950/60 dark:text-blue-300">
            Balikin Admin Control Center
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Real-time metrics and operational controls
          </p>
        </div>
        <nav className="relative flex w-full gap-3 md:w-auto" aria-label="Dashboard actions">
          <button
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:flex-none"
            aria-label="Search dashboard"
            type="button"
          >
            <Search size={16} aria-hidden="true" />
            <span>Search</span>
          </button>
        </nav>
        </div>
      </header>

      {/* Dashboard Stats */}
      <section aria-label="Key Metrics">
        <DashboardStats
          totalUsers={stats.totalUsers}
          totalTags={stats.exactTagsCount || stats.totalTags}
          lostTags={stats.lostTags}
          premiumTags={stats.premiumTags}
          revenue={stats.revenue}
          materials={stats.materials}
          dailyOrdersSeries={stats.dailyOrdersSeries}
          tagDistribution={stats.tagDistribution}
          production={stats.production}
        />
      </section>

      {/* Operational Overview Section */}
      <section aria-labelledby="operational-overview-heading">
        <h2 id="operational-overview-heading" className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-gray-900 dark:text-white">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600" aria-hidden="true"></span>
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
          <ActivityFeed activities={activityData} />
        </section>
        <section aria-label="Critical Alerts">
          <CriticalAlerts
            materials={stats.materials.lowStockItems?.map(m => ({ name: m.materialType, quantity: m.quantity }))}
            recentTags={recentTagsData}
            dbConnected={dbConnected}
            pendingPaymentOrders={stats.pendingOrders}
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

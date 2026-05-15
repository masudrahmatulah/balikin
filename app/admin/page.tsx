import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { CriticalAlerts } from "@/components/admin/critical-alerts";
import {
  DashboardStatsSkeleton,
  ActivityFeedSkeleton,
  CriticalAlertsSkeleton,
} from "@/components/admin/skeletons";
import { getDashboardStatsServer, getPendingCountsServer } from "@/app/admin/actions/stock-actions";
import { Download, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  // Fetch dashboard data using server actions
  const [dashboardStats, pendingCounts] = await Promise.allSettled([
    getDashboardStatsServer(),
    getPendingCountsServer(),
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time metrics and system status
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
            <Search size={16} />
            <span>Search</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        totalUsers={stats.totalUsers}
        totalTags={stats.totalTags}
        lostTags={stats.lostTags}
        revenue={stats.revenue}
        materials={stats.materials}
      />

      {/* Dashboard Body - Main Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed />
        <CriticalAlerts materials={stats.materials.lowStockItems?.map(m => ({ name: m.materialType, quantity: m.quantity }))} />
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

      {/* Skeleton Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeedSkeleton />
        <CriticalAlertsSkeleton />
      </div>
    </div>
  );
};

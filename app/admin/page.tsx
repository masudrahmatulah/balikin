import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { CriticalAlerts } from "@/components/admin/critical-alerts";
import { getDashboardStatsServer, getPendingCountsServer } from "@/app/admin/actions/stock-actions";

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

  const stats = dashboardStats.status === 'fulfilled' ? dashboardStats.value : {
    totalUsers: 0,
    totalTags: 0,
    totalOrders: 0,
  };

  const pending = pendingCounts.status === 'fulfilled' ? pendingCounts.value : {
    pendingOrders: 0,
    pendingRequests: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">System Overview</h2>
          <p className="text-on-surface-variant">Real-time ecosystem health and operational metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-container transition-colors active:scale-95">
            <span className="material-symbols-outlined !text-[20px]" data-icon="calendar_today">
              calendar_today
            </span>
            Last 24 Hours
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded hover:bg-surface-container transition-colors active:scale-95">
            <span className="material-symbols-outlined !text-[20px]" data-icon="download">
              download
            </span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <DashboardStats
        totalUsers={stats.totalUsers}
        totalTags={stats.totalTags}
        lostTags={42}
        revenue={{
          daily: {
            total: 1500000,
            count: 15,
            period: "daily",
          },
          monthly: {
            total: 48200000,
            count: 342,
            period: "monthly",
          },
        }}
        materials={{
          total: 15,
          lowStockCount: 2,
        }}
      />

      {/* Dashboard Body */}
      <div className="grid grid-cols-12 gap-6">
        <ActivityFeed />
        <CriticalAlerts />
      </div>
    </div>
  );
}

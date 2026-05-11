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
    lostTags: 0,
    revenue: {
      daily: { total: 0, count: 0, period: "daily" },
      monthly: { total: 0, count: 0, period: "monthly" },
    },
    materials: { total: 0, lowStockCount: 0, lowStockItems: [] },
  };

  return (
    <div className="space-y-12">
      {/* Page Header - Heritage Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-secondary/10 pb-8">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary tracking-tight">System Overview</h2>
          <p className="font-body text-sm text-secondary mt-2">Real-time ecosystem health and operational metrics.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 border border-secondary/20 text-primary font-label text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-neutral transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined !text-[16px]" data-icon="calendar_today">
              calendar_today
            </span>
            Last 24 Hours
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-surface font-label text-[10px] font-bold uppercase tracking-widest rounded-sm hover:brightness-110 transition-all active:scale-[0.98] shadow-sm">
            <span className="material-symbols-outlined !text-[16px]" data-icon="download">
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
        lostTags={stats.lostTags}
        revenue={stats.revenue}
        materials={stats.materials}
      />

      {/* Dashboard Body */}
      <div className="grid grid-cols-12 gap-8">
        <ActivityFeed />
        <CriticalAlerts materials={stats.materials.lowStockItems?.map(m => ({ name: m.materialType, quantity: m.quantity }))} />
      </div>
    </div>
  );
}

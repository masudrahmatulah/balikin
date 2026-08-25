import { cn } from "@/lib/utils";
import { AdminCard } from "./base/admin-card";
import { StatCard, StatCardWithChart } from "./base/stat-card";
import { Users, Star, Package, CheckCircle2 } from "lucide-react";

interface RevenueStats {
  total: number;
  count: number;
  period: string;
}

interface MaterialAlert {
  total: number;
  lowStockCount: number;
  lowStockItems?: Array<{ materialType: string; quantity: number; unit: string }>;
}

interface TagDistributionSlice {
  label: string;
  percent: number;
}

interface ProductionStats {
  total: number;
  completed: number;
  pending: number;
}

interface DashboardStatsProps {
  totalUsers: number;
  totalTags: number;
  lostTags: number;
  premiumTags: number;
  revenue: {
    daily: RevenueStats;
    monthly: RevenueStats;
  };
  materials: MaterialAlert;
  dailyOrdersSeries: number[];
  tagDistribution: TagDistributionSlice[];
  production: ProductionStats;
}

const DISTRIBUTION_COLORS = ["#2563eb", "#10b981", "#9ca3af"];

export function DashboardStats({
  totalUsers,
  totalTags,
  lostTags,
  premiumTags,
  revenue,
  materials,
  dailyOrdersSeries,
  tagDistribution,
  production,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Real conversion rate: premium tags / total tags
  const premiumConversion = totalTags > 0 ? (premiumTags / totalTags) * 100 : 0;

  // Real print-queue completion rate
  const completionRate = production.total > 0
    ? Math.round((production.completed / production.total) * 100)
    : 0;

  // Real distribution percentages for the donut SVG
  const slices = tagDistribution.length > 0
    ? tagDistribution
    : [{ label: "No data", percent: 100 }];
  let accumulated = 0;
  const circumference = 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Tags - Primary Metric */}
      <StatCard
        label="Total Tag Terdaftar"
        value={totalTags}
        highlight={lostTags > 0}
      />

      {/* Active Lost Items - Highlighted */}
      <StatCard
        label="Laporan Barang Hilang"
        value={lostTags}
        trendLabel={lostTags > 0 ? "active items" : "no active reports"}
        highlight={lostTags > 0}
      />

      {/* Monthly Revenue */}
      <StatCard
        label="Pendapatan (Bulan Ini)"
        value={formatCurrency(revenue.monthly.total)}
        trendLabel={`${revenue.monthly.count} order dibayar`}
      />

      {/* Total Users */}
      <StatCard
        label="Total Klien"
        value={totalUsers}
        icon={Users}
      />

      {/* Premium Conversion */}
      <StatCard
        label="Konversi Premium"
        value={`${premiumConversion.toFixed(1)}%`}
        icon={Star}
        trendLabel={`${premiumTags} dari ${totalTags} tag`}
      />

      {/* Daily Orders with Chart */}
      <StatCardWithChart
        label="Order Dibayar Hari Ini"
        value={revenue.daily.count}
        chartData={dailyOrdersSeries}
        trendLabel="7 hari terakhir"
        icon={Package}
      />

      {/* Tag Distribution */}
      <AdminCard title="Tag Distribution" variant="bordered" className="h-full">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              {slices.map((slice, idx) => {
                const dash = (slice.percent / circumference) * circumference;
                const offset = -accumulated;
                accumulated += slice.percent;
                return (
                  <circle
                    key={slice.label}
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length]}
                    strokeWidth="3"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeLinecap="round"
                    strokeDashoffset={offset}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            {slices.map((slice, idx) => (
              <div key={slice.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{slice.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{slice.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Print Queue Status */}
      <AdminCard title="Print Queue" variant="bordered" className="h-full">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Selesai</span>
              <span className="font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {production.completed} dari {production.total} batch
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Menunggu Proses</span>
              <span className="font-semibold text-gray-900 dark:text-white">{production.pending}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn("h-2 rounded-full", production.pending > 0 ? "bg-amber-500" : "bg-green-500")}
                style={{ width: `${production.total > 0 ? (production.pending / production.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Critical Stock Alert */}
      {materials.lowStockCount > 0 ? (
        <AdminCard
          title="Stok Kritis"
          variant="highlighted"
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="space-y-2">
            {materials.lowStockItems?.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.materialType}</span>
                <span className="text-sm font-bold text-amber-600">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : (
        <AdminCard
          title="Stok Aman"
          variant="bordered"
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-sm">Semua material dalam stok</span>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

// Loading state component
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse"
        >
          <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
          <div className="h-10 w-20 bg-gray-200 rounded mb-2" />
          <div className="h-12 w-32 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

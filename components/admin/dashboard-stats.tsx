import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { AdminCard } from "./base/admin-card";
import { StatCard, StatCardWithChart } from "./base/stat-card";

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

interface DashboardStatsProps {
  totalUsers: number;
  totalTags: number;
  lostTags: number;
  revenue: {
    daily: RevenueStats;
    monthly: RevenueStats;
  };
  materials: MaterialAlert;
}

export function DashboardStats({
  totalUsers,
  totalTags,
  lostTags,
  revenue,
  materials,
}: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const revenueTrend = totalTags > 0
    ? { value: Math.round((totalTags / 100) * 12), isPositive: true }
    : { value: 0, isPositive: false };

  const lostTrend = lostTags > 0
    ? { value: Math.floor(lostTags * 0.3), isPositive: false }
    : { value: 0, isPositive: true };

  const conversionTrend = { value: 34.2, isPositive: true };
  const dailyOrders = 128;
  const dailyOrdersTrend = { value: 14, isPositive: true };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Tags - Primary Metric */}
      <StatCard
        label="Total Tag Aktif"
        value={totalTags}
        trend={revenueTrend}
        trendLabel="vs last month"
        highlight={lostTags > 0}
      />

      {/* Active Lost Items - Highlighted */}
      {lostTags > 0 ? (
        <StatCard
          label="Laporan Barang Hilang"
          value={lostTags}
          trend={lostTrend}
          trendLabel="active items"
          highlight
        />
      ) : (
        <StatCard
          label="Laporan Barang Hilang"
          value={0}
          trend={{ value: 0, isPositive: true }}
          trendLabel="no active reports"
        />
      )}

      {/* Monthly Revenue */}
      <StatCard
        label="Pendapatan (Bulan Ini)"
        value={formatCurrency(revenue.monthly.total)}
        trend={{
          value: Math.round((revenue.monthly.total / 10000000) * 5),
          isPositive: revenue.monthly.total > 0,
        }}
        trendLabel="vs last month"
      />

      {/* Total Users */}
      <StatCard
        label="Total Klien"
        value={totalUsers}
        icon="👥"
      />

      {/* Premium Conversion */}
      <StatCard
        label="Konversi Premium"
        value="34.2%"
        trend={conversionTrend}
        icon="⭐"
      />

      {/* Daily Orders with Chart */}
      <StatCardWithChart
        label="Order Harian"
        value={dailyOrders}
        chartData={[40, 65, 45, 90, 55, 80, 75]}
        trend={dailyOrdersTrend}
        icon="📦"
      />

      {/* Tag Distribution */}
      <AdminCard title="Tag Distribution" variant="bordered" className="h-full">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="60 40" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="25 75" strokeLinecap="round" strokeDashoffset="-60" />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-700">Stickers</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">60%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-700">Acrylic</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-700">Other</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">15%</span>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* Production Efficiency */}
      <AdminCard title="Production Efficiency" variant="bordered" className="h-full">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Daily Target</span>
              <span className="font-semibold text-gray-900">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Weekly Average</span>
              <span className="font-semibold text-gray-900">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Defect Rate</span>
              <span className="font-semibold text-green-600">2.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "2.3%" }} />
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
                <span className="text-sm text-gray-700">{item.materialType}</span>
                <span className="text-sm font-bold text-amber-600">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 px-4 bg-amber-600 text-white text-sm font-semibold rounded-md hover:bg-amber-700 transition-colors">
            Order Supplies
          </button>
        </AdminCard>
      ) : (
        <AdminCard
          title="Stok Aman"
          variant="bordered"
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3 text-gray-600">
            <span className="text-2xl">✓</span>
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

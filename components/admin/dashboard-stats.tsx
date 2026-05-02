"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RevenueStats {
  total: number;
  count: number;
  period: string;
}

interface MaterialAlert {
  total: number;
  lowStockCount: number;
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
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "monthly">("daily");
  const currentRevenue = revenuePeriod === "daily" ? revenue.daily : revenue.monthly;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Klien */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Klien</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Tag Aktif */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tag Aktif</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalTags}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tag Hilang */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tag Hilang</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{lostTags}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Material Stock Alerts */}
      <div
        className={cn(
          "rounded-xl shadow-sm p-6 border",
          materials.lowStockCount > 0
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Stok Material</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{materials.lowStockCount}</p>
              <span className="text-sm text-gray-500 dark:text-gray-400">kritikal</span>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              materials.lowStockCount > 0
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            )}
          >
            <svg
              className={cn(
                "w-6 h-6",
                materials.lowStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Pendapatan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendapatan</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(currentRevenue.total)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {currentRevenue.count} order {revenuePeriod === "daily" ? "hari ini" : "bulan ini"}
            </p>
          </div>

          {/* Revenue Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setRevenuePeriod("daily")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                revenuePeriod === "daily"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Harian
            </button>
            <button
              onClick={() => setRevenuePeriod("monthly")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                revenuePeriod === "monthly"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Bulanan
            </button>
          </div>
        </div>

        {/* Revenue comparison indicator */}
        <div className="flex items-center gap-2 text-sm">
          {revenuePeriod === "daily" && revenue.monthly.total > 0 && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>
                {((revenue.daily.total / (revenue.monthly.total / 30)) * 100).toFixed(0)}% dari rata-rata harian bulan ini
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

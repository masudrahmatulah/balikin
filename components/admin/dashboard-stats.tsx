"use client";

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-12 gap-6 mb-8">
      {/* Total Tag Aktif */}
      <div className="col-span-12 md:col-span-3 bg-surface-container p-6 rounded-xl border border-white/5 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Tag Aktif</span>
          <span className="material-symbols-outlined text-balikin-gold !text-[24px]" data-icon="check_circle">
            check_circle
          </span>
        </div>
        <div className="relative z-10">
          <p className="font-headline-xl text-headline-xl text-on-surface">{totalTags.toLocaleString()}</p>
          <p className="text-status-resolved text-sm font-medium flex items-center gap-1 mt-2">
            <span className="material-symbols-outlined !text-[16px]" data-icon="trending_up">
              trending_up
            </span>
            +12% vs last month
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 text-[100px] text-white/5 font-bold select-none rotate-12">
          TAG
        </div>
      </div>

      {/* Laporan Barang Hilang */}
      <div className="col-span-12 md:col-span-6 bg-surface-container p-6 rounded-xl border border-white/5">
        <div className="flex justify-between items-start mb-6">
          <span className="font-label-caps text-label-caps text-outline uppercase">Laporan Barang Hilang</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-status-open rounded-full"></div>
              <span className="text-xs text-on-surface-variant uppercase font-bold">Open</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-status-resolved rounded-full"></div>
              <span className="text-xs text-on-surface-variant uppercase font-bold">Resolved</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex gap-12">
            <div>
              <p className="font-headline-xl text-headline-xl text-status-open">{lostTags}</p>
              <p className="text-xs text-outline uppercase font-bold mt-1">Laporan Aktif</p>
            </div>
            <div>
              <p className="font-headline-xl text-headline-xl text-status-resolved">
                {Math.floor(lostTags * 28.7).toLocaleString()}
              </p>
              <p className="text-xs text-outline uppercase font-bold mt-1">Total Selesai</p>
            </div>
          </div>
          <div className="w-1/3 h-16 flex items-end gap-1">
            <div className="flex-1 bg-status-open h-[60%] rounded-t-sm opacity-60"></div>
            <div className="flex-1 bg-status-open h-[80%] rounded-t-sm opacity-60"></div>
            <div className="flex-1 bg-status-open h-[40%] rounded-t-sm opacity-60"></div>
            <div className="flex-1 bg-status-open h-[90%] rounded-t-sm"></div>
          </div>
        </div>
      </div>

      {/* Total Pendapatan */}
      <div className="col-span-12 md:col-span-3 bg-surface-container p-6 rounded-xl border border-white/5">
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Pendapatan</span>
          <span className="material-symbols-outlined text-balikin-gold !text-[24px]" data-icon="payments">
            payments
          </span>
        </div>
        <p className="font-headline-xl text-headline-xl text-balikin-gold">
          {formatCurrency(revenue.monthly.total)}
        </p>
        <p className="text-on-surface-variant text-sm font-medium mt-2">
          Target: Rp 50M (96%)
        </p>
        <div className="w-full bg-surface-variant h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-gradient-to-r from-balikin-gold to-status-resolved h-full w-[96%]"></div>
        </div>
      </div>

      {/* Material Stock Alerts */}
      <div
        className={cn(
          "col-span-12 md:col-span-3 bg-surface-container p-6 rounded-xl border border-white/5",
          materials.lowStockCount > 0 && "border-2 border-status-critical animate-pulse shadow-[0_0_15px_rgba(255,77,77,0.2)]"
        )}
      >
        <div className="flex justify-between items-start mb-4">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Klien</span>
          <span className="material-symbols-outlined text-balikin-gold !text-[24px]" data-icon="group">
            group
          </span>
        </div>
        <div className="relative z-10">
          <p className="font-headline-xl text-headline-xl text-on-surface">{totalUsers.toLocaleString()}</p>
          <p className="text-on-surface-variant text-sm font-medium mt-2">
            Registered users
          </p>
        </div>
      </div>

      {/* Material Critical Alert */}
      {materials.lowStockCount > 0 && (
        <div className="col-span-12 md:col-span-6 bg-surface-container-high border-2 border-status-critical animate-pulse p-6 rounded-xl shadow-[0_0_15px_rgba(255,77,77,0.2)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-status-critical/20 rounded flex items-center justify-center text-status-critical">
              <span className="material-symbols-outlined !text-[32px]" data-icon="inventory_2" style={{ fontVariationSettings: "'FILL' 1" }}>
                inventory_2
              </span>
            </div>
            <div>
              <h4 className="font-bold text-status-critical text-headline-md">Stok Material Kritis</h4>
              <p className="text-on-surface-variant text-sm">Action required immediately</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-surface-deep/40 p-3 rounded">
              <span className="text-sm font-medium">Acrylic QR Tags (L)</span>
              <span className="text-status-critical font-bold">12 units</span>
            </div>
            <div className="flex justify-between items-center bg-surface-deep/40 p-3 rounded">
              <span className="text-sm font-medium">Sticker Vinyl Roll</span>
              <span className="text-status-critical font-bold">2 units</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-status-critical text-white py-3 rounded font-bold hover:brightness-110 transition-all">
            Order Supplies Now
          </button>
        </div>
      )}

      {/* Premium Conversion Rate */}
      <div className="col-span-12 md:col-span-3 bg-gradient-to-br from-surface-container-high to-surface-deep p-6 rounded-xl border border-balikin-gold/20 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-balikin-gold !text-[24px]" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span className="text-on-surface font-bold">Premium Conversion</span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-on-surface">34.2%</span>
          <span className="text-status-resolved text-xs font-bold pb-1">+2.4%</span>
        </div>
        <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
          <div className="h-full bg-balikin-gold w-[34.2%] shadow-[0_0_8px_#FFD700]"></div>
        </div>
      </div>
    </div>
  );
}

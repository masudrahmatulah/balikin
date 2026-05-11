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
    <div className="grid grid-cols-12 gap-8 mb-12">
      {/* Total Tag Aktif */}
      <div className="col-span-12 md:col-span-3 bg-surface p-8 rounded-lg border border-secondary/10 relative overflow-hidden group shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <span className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Total Tag Aktif</span>
          <span className="material-symbols-outlined text-primary !text-[20px]" data-icon="check_circle">
            check_circle
          </span>
        </div>
        <div className="relative z-10">
          <p className="font-display text-5xl font-bold text-primary">{totalTags.toLocaleString()}</p>
          <p className="text-secondary text-xs mt-3 flex items-center gap-1 font-body">
            <span className="text-tertiary font-bold">+12%</span> vs last month
          </p>
        </div>
      </div>

      {/* Laporan Barang Hilang */}
      <div className="col-span-12 md:col-span-6 bg-surface p-8 rounded-lg border border-secondary/10 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <span className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Laporan Barang Hilang</span>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-tertiary rounded-full"></div>
              <span className="font-label text-[9px] text-primary uppercase tracking-widest font-bold">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="font-label text-[9px] text-secondary uppercase tracking-widest font-bold">Resolved</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex gap-16">
            <div>
              <p className="font-display text-5xl font-bold text-tertiary">{lostTags}</p>
              <p className="font-label text-[9px] text-secondary uppercase tracking-widest font-bold mt-2">Laporan Aktif</p>
            </div>
            <div>
              <p className="font-display text-5xl font-bold text-primary">
                {Math.floor(lostTags * 2.5).toLocaleString()}
              </p>
              <p className="font-label text-[9px] text-secondary uppercase tracking-widest font-bold mt-2">Total Selesai</p>
            </div>
          </div>
          {/* Minimalist Sparkline Placeholder */}
          <div className="w-1/4 h-12 flex items-end gap-1.5 opacity-20">
            {[40, 60, 45, 90, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Total Pendapatan */}
      <div className="col-span-12 md:col-span-3 bg-surface p-8 rounded-lg border border-secondary/10 shadow-sm border-t-4 border-t-tertiary">
        <div className="flex justify-between items-start mb-6">
          <span className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Pendapatan (Bln)</span>
          <span className="material-symbols-outlined text-tertiary !text-[20px]" data-icon="payments">
            payments
          </span>
        </div>
        <p className="font-display text-4xl font-bold text-primary">
          {formatCurrency(revenue.monthly.total)}
        </p>
        <p className="font-body text-secondary text-xs mt-3">
          Daily: <span className="text-primary font-bold">{formatCurrency(revenue.daily.total)}</span>
        </p>
        <div className="w-full bg-neutral h-1 rounded-full mt-6 overflow-hidden">
          <div className="bg-tertiary h-full w-[85%]"></div>
        </div>
      </div>

      {/* Material Stock Alerts */}
      <div
        className={cn(
          "col-span-12 md:col-span-3 bg-surface p-8 rounded-lg border border-secondary/10 shadow-sm",
          materials.lowStockCount > 0 && "border-l-4 border-l-tertiary"
        )}
      >
        <div className="flex justify-between items-start mb-6">
          <span className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] font-bold">Total Klien</span>
          <span className="material-symbols-outlined text-primary !text-[20px]" data-icon="group">
            group
          </span>
        </div>
        <div className="relative z-10">
          <p className="font-display text-5xl font-bold text-primary">{totalUsers.toLocaleString()}</p>
          <p className="font-body text-secondary text-xs mt-3 uppercase tracking-wider font-bold">
            Registered users
          </p>
        </div>
      </div>

      {/* Heritage Style Alert Card */}
      {materials.lowStockCount > 0 && (
        <div className="col-span-12 md:col-span-6 bg-primary text-surface p-8 rounded-lg shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="w-14 h-14 bg-tertiary rounded-sm flex items-center justify-center text-surface">
              <span className="material-symbols-outlined !text-[32px]" data-icon="inventory_2" style={{ fontVariationSettings: "'FILL' 1" }}>
                inventory_2
              </span>
            </div>
            <div>
              <h4 className="font-display text-2xl font-bold tracking-tight">STOK KRITIS</h4>
              <p className="font-label text-[10px] text-surface/60 uppercase tracking-[0.2em]">Action required immediately</p>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            {materials.lowStockItems?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-surface/10 pb-3">
                <span className="font-body text-sm font-medium">{item.materialType}</span>
                <span className="font-display text-lg font-bold text-tertiary">{item.quantity} {item.unit}</span>
              </div>
            )) || (
              <div className="flex justify-between items-center border-b border-surface/10 pb-3">
                <span className="font-body text-sm font-medium">Acrylic QR Tags (L)</span>
                <span className="font-display text-lg font-bold text-tertiary">12 units</span>
              </div>
            )}
          </div>
          <button className="w-full mt-8 bg-tertiary text-surface py-4 rounded-sm font-label text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all relative z-10">
            Order Supplies
          </button>
          {/* Minimalist background element */}
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <span className="material-symbols-outlined !text-[120px]">warning</span>
          </div>
        </div>
      )}

      {/* Premium Conversion Rate */}
      <div className="col-span-12 md:col-span-3 bg-neutral p-8 rounded-lg border border-secondary/10 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary !text-[20px]" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified
          </span>
          <span className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Premium Conversion</span>
        </div>
        <div className="mt-8">
          <div className="flex items-end gap-3">
            <span className="font-display text-5xl font-bold text-primary">34.2%</span>
            <span className="font-body text-tertiary text-sm font-bold pb-2">+2.4%</span>
          </div>
          <div className="h-2 bg-surface rounded-full mt-4 overflow-hidden border border-secondary/5">
            <div className="h-full bg-primary w-[34.2%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

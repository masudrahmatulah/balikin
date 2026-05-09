import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { printQueue, materialInventory } from "@/db/schema";
import { desc, count, eq, and } from "drizzle-orm";
import { StockStatusIndicator } from "@/components/admin/stock-status-indicator";
import { Link } from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  Printer,
  FileText,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Plus,
  Settings
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductionDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/production");
  }

  // Get print queue statistics
  const queueStats = await db
    .select({
      total: count(),
      inProduction: count(),
      ready: count(),
    })
    .from(printQueue)
    .where(eq(printQueue.status, "printed"));

  const totalInQueue = queueStats[0]?.total || 0;

  // Get print queue status breakdown
  const queueByStatus = await db
    .select({
      status: printQueue.status,
      count: count(),
    })
    .from(printQueue)
    .groupBy(printQueue.status);

  const statusCounts = queueByStatus.reduce((acc, item) => {
    acc[item.status || "unknown"] = item.count;
    return acc;
  }, {} as Record<string, number>);

  // Get recent material logs (last 5)
  const recentLogs = await db.query.materialInventory.findMany({
    orderBy: [desc(materialInventory.lastRestockedAt)],
    with: {
      addedByUser: true,
    },
    limit: 5,
  });

  // Calculate totals
  const totalQueued = statusCounts["queued"] || 0;
  const totalInProduction = statusCounts["in_production"] || 0;
  const totalPrinted = statusCounts["printed"] || 0;
  const totalShipped = statusCounts["shipped"] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Production Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview dari operasional produksi dan status stok
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total in Queue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Antrian Cetak</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {totalQueued}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Printer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* In Production */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dalam Produksi</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {totalInProduction}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Ready to Ship */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Siap Kirim</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {totalPrinted}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Shipped Today */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Terkirim</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {totalShipped}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Status Indicator */}
      <StockStatusIndicator autoRefresh={true} />

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/production/bulk-qr">
            <Button className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Bulk QR Generator
            </Button>
          </Link>
          <Link href="/admin/print-queue">
            <Button variant="outline" className="w-full gap-2">
              <Printer className="w-4 h-4" />
              Print Queue
            </Button>
          </Link>
          <Link href="/admin/material-logs">
            <Button variant="outline" className="w-full gap-2">
              <FileText className="w-4 h-4" />
              Material Logs
            </Button>
          </Link>
          <Link href="/admin/vdp-tool">
            <Button variant="outline" className="w-full gap-2">
              <Settings className="w-4 h-4" />
              VDP Tool
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Material Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Material Terakhir Ditambahkan</h2>
          <Link href="/admin/material-logs">
            <Button variant="outline" size="sm" className="gap-2">
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada material logs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {log.materialType}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({log.materialSize})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Stok: {log.currentStock} {log.unit} |
                    Ditambahkan oleh {log.addedByUser?.name || log.addedByUser?.email || "Unknown"}
                  </p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {log.lastRestockedAt ? new Date(log.lastRestockedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }) : "-"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

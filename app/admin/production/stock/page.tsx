import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { StockStatusIndicator } from "@/components/admin/stock-status-indicator";
import { StockListTable } from "@/components/admin/stock-list-table";

export const dynamic = "force-dynamic";

export default async function ProductionStockPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/production/stock");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Status Stok Produksi
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitoring real-time inventory dan status produksi QR tags
        </p>
      </div>

      {/* Stock Status Indicator */}
      <StockStatusIndicator autoRefresh={true} />

      {/* Stock List Table */}
      <StockListTable />

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Tentang Status Stok
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• <strong>Produced:</strong> Total QR tags yang sudah diproduksi</li>
              <li>• <strong>Claimed:</strong> QR tags yang sudah diklaim/diaktifkan oleh user</li>
              <li>• <strong>Unclaimed:</strong> QR tags yang tersedia dan siap digunakan</li>
              <li>• <strong>Low Stock Alert:</strong> Muncul ketika unclaimed tags di bawah 50</li>
            </ul>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
              Data di-refresh otomatis setiap 30 detik untuk memastikan informasi terkini.
            </p>
          </div>
        </div>
      </div>

      {/* Stock by Type Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Kategori Stok</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Stickers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                QR tags stiker kertas standar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔖</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Acrylic Tags</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                QR tags akrilik premium
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Bundles</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paket bundle modul spesifik
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <a
            href="/admin/production/bulk-qr"
            className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Generate Bulk QR
          </a>
          <a
            href="/admin/material-logs"
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Material Logs
          </a>
          <a
            href="/admin/qr-stok"
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            QR Stok Management
          </a>
        </div>
      </div>
    </div>
  );
}

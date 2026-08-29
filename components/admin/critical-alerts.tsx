import { AlertCard } from "./base/alert-box";
import { RecentQRPreviews } from "./recent-qr-previews";
import { AlertTriangle, Zap, ClipboardList, Settings2 } from "lucide-react";

interface MaterialAlert {
  name: string;
  quantity: number;
}

interface RecentTag {
  id: string;
  slug: string;
  name: string;
  tier: string;
  createdAt: string;
}

interface CriticalAlertsProps {
  materials?: MaterialAlert[];
  recentTags?: RecentTag[];
  dbConnected?: boolean;
  pendingPaymentOrders?: number;
}

const defaultMaterials: MaterialAlert[] = [];

export function CriticalAlerts({
  materials = defaultMaterials,
  recentTags,
  dbConnected = true,
  pendingPaymentOrders = 0,
}: CriticalAlertsProps) {
  const highPriority = materials.filter((m) => m.quantity <= 5);
  const mediumPriority = materials.filter((m) => m.quantity > 5 && m.quantity <= 10);
  const lowPriority = materials.filter((m) => m.quantity > 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Critical Stock Alert */}
      {highPriority.length > 0 && (
        <AlertCard
          type="error"
          icon={AlertTriangle}
          title="Stok Kritis"
          message="Beberapa material dalam jumlah terbatas"
          items={highPriority.map((item) => ({
            label: item.name,
            value: `${item.quantity} unit`,
          }))}
          primaryAction={{
            label: "Order Supplies",
            onClick: () => console.log("Order supplies"),
          }}
        />
      )}

      {/* Medium Stock Alert */}
      {mediumPriority.length > 0 && (
        <AlertCard
          type="warning"
          icon={Zap}
          title="Stok Menipis"
          message="Beberapa material dalam jumlah terbatas"
          items={mediumPriority.map((item) => ({
            label: item.name,
            value: `${item.quantity} unit`,
          }))}
          primaryAction={{
            label: "Order Supplies",
            onClick: () => console.log("Order supplies"),
          }}
        />
      )}

      {/* Low Stock Status */}
      {lowPriority.length > 0 && (
        <AlertCard
          type="success"
          title="Stok Aman"
          message="Semua material dalam jumlah yang cukup"
          items={lowPriority.map((item) => ({
            label: item.name,
            value: `${item.quantity} unit`,
          }))}
        />
      )}

      {/* Recent VDP Previews */}
      <AlertCard
        type="info"
        icon={ClipboardList}
        title="Recent VDP Previews"
        message="QR codes yang baru saja di-generate"
      >
        <RecentQRPreviews recentTags={recentTags || []} />
      </AlertCard>

      {/* Operational Status */}
      <AlertCard
        type={dbConnected ? "info" : "error"}
        icon={Settings2}
        title="Operational Status"
        message="System and service status"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-slate-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Database</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                dbConnected
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }`}
            >
              {dbConnected ? "Connected" : "Error"}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-slate-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Menunggu Pembayaran</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {pendingPaymentOrders} order
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Stok Material Kritis</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                materials.length > 0
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              }`}
            >
              {materials.length} item
            </span>
          </div>
        </div>
      </AlertCard>
    </div>
  );
}

// Loading state
export function CriticalAlertsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ))}
      {/* Recent VDP Previews Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
        <div className="h-10 w-full bg-gray-200 rounded-md mt-4 animate-pulse" />
      </div>
    </div>
  );
}

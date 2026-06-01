import { cn } from "@/lib/utils";

// Simplified skeleton for stats cards
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

// Simplified skeleton for activity feed
export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded mt-1 animate-pulse" />
      </div>
      <div className="p-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 ml-9">
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Simplified skeleton for critical alerts
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
    </div>
  );
}

// Skeleton for tags table
export function TagsTableSkeleton() {
  return (
    <div>
      <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-40 h-10 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 w-12">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mx-auto" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-4">
                  <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

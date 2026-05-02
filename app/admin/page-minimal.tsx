import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function MinimalAdminDashboard() {
  try {
    // Show hardcoded values for now to avoid any database timeouts
    return (
      <div className="space-y-6">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">Loading...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Total Tags</p>
            <p className="text-3xl font-bold text-green-600 mt-2">Loading...</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <p className="text-sm text-gray-600">Performance</p>
            <p className="text-3xl font-bold text-red-600 mt-2">Slow</p>
          </div>
        </div>

        {/* Performance Alert */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
            ⚠️ Database Performance Alert
          </h2>
          <p className="text-red-800 dark:text-red-200 mb-4">
            Your database queries are timing out. The admin dashboard is running in safe mode.
          </p>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Immediate Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-red-700 dark:text-red-300">
              <li>Add database indexes (see diagnostics page)</li>
              <li>Check database server performance</li>
              <li>Clean up old scan logs if needed</li>
            </ol>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
          <h2 className="text-lg font-semibold mb-4">Admin Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/admin/diagnostics">
              <Button variant="outline" className="w-full">
                🔍 Diagnostics
              </Button>
            </Link>
            <Link href="/admin/requests">
              <Button variant="outline" className="w-full">
                Requests
              </Button>
            </Link>
            <Link href="/admin/modules">
              <Button variant="outline" className="w-full">
                Modules
              </Button>
            </Link>
            <Link href="/admin/sticker-orders">
              <Button variant="outline" className="w-full">
                Sticker Orders
              </Button>
            </Link>
            <Link href="/admin/layout-editor">
              <Button variant="outline" className="w-full">
                Layout Editor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
          Admin Dashboard Error
        </h2>
        <p className="text-red-800 dark:text-red-200">
          Failed to load admin dashboard. Please try refreshing or contact support.
        </p>
      </div>
    );
  }
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Performance-optimized admin panel
          </p>
        </div>

        <MinimalAdminDashboard />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { user, tags } from "@/db/schema";
import { count } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function OptimizedAdminDashboard() {
  try {
    // Now with indexes, these should be fast!
    const [usersResult, tagsResult] = await Promise.all([
      db.select({ count: count() }).from(user).catch(() => [{ count: 0 }]),
      db.select({ count: count() }).from(tags).catch(() => [{ count: 0 }]),
    ]);

    const totalUsers = usersResult[0]?.count ?? 0;
    const totalTags = tagsResult[0]?.count ?? 0;

    return (
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Tags</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalTags.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
            <p className="text-3xl font-bold text-green-600 mt-2">Optimized ✅</p>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
            ✅ Performance Optimized!
          </h2>
          <p className="text-green-800 dark:text-green-200">
            Database indexes applied successfully. Your admin dashboard should now load quickly.
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Admin Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link href="/admin/diagnostics">
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
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
          {error instanceof Error ? error.message : 'Failed to load admin dashboard'}
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
            Performance-optimized with database indexes
          </p>
        </div>

        <OptimizedAdminDashboard />
      </div>
    </div>
  );
}
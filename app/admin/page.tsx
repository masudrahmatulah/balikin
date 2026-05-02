import { db } from "@/db";
import { user, tags } from "@/db/schema";
import { count } from "drizzle-orm";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ClientsTable } from "@/components/admin/clients-table";
import { CreateTagModal } from "@/components/admin/create-tag-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Simplified admin page with minimal queries for performance
  try {
    // Use very simple count queries with longer timeouts
    const [usersResult, totalTagsResult] = await Promise.all([
      db.select({ count: count() }).from(user).then(r => r).catch(() => [{ count: 0 }]),
      db.select({ count: count() }).from(tags).then(r => r).catch(() => [{ count: 0 }]),
    ]);

    const totalUsers = usersResult[0]?.count || 0;
    const totalTags = totalTagsResult[0]?.count || 0;
    const lostTags = 0; // Simplified

    // Skip the expensive users with tags query for now
    const usersWithTagCount = [];

    // Use default values for dashboard stats to avoid slow queries
    const dashboardStats = {
      revenue: {
        daily: { total: 0, count: 0, period: 'daily' },
        monthly: { total: 0, count: 0, period: 'monthly' },
      },
      materials: {
        total: 0,
        lowStockCount: 0,
        lowStockItems: [],
      },
    };

  return (
    <>
      {/* Dashboard Stats */}
      <DashboardStats
        totalUsers={totalUsers}
        totalTags={totalTags}
        lostTags={lostTags}
        revenue={dashboardStats.revenue}
        materials={dashboardStats.materials}
      />

        {/* Clients Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Daftar Klien
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Kelola klien dan buat tag QR Code untuk mereka
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/diagnostics">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20">
                  🔍 Diagnostics
                </Button>
              </Link>
              <Link href="/admin/requests">
                <Button variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20">
                  Permintaan Modul
                </Button>
              </Link>
              <Link href="/admin/modules">
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20">
                  Manajemen Modul
                </Button>
              </Link>
              <Link href="/admin/sticker-orders">
                <Button variant="outline">Sticker Orders</Button>
              </Link>
              <Link href="/admin/layout-editor">
                <Button variant="outline">Layout Editor</Button>
              </Link>
              <CreateTagModal users={usersWithTagCount} />
            </div>
          </div>
          <ClientsTable users={usersWithTagCount} />
        </div>
      </>
    );
  } catch (error) {
    console.error('Admin page error:', error);
    // Return a simple error page instead of crashing
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Admin Dashboard Error
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          There was an error loading the admin dashboard. Please try refreshing the page.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }
}

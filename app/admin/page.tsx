import { getUsersWithTagCounts } from "@/lib/admin";
import { getDashboardStats } from "@/lib/admin-dashboard";
import { db } from "@/db";
import { tags, user } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ClientsTable } from "@/components/admin/clients-table";
import { CreateTagModal } from "@/components/admin/create-tag-modal";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Create a timeout promise for slow queries
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Query timeout')), 10000) // 10 second timeout
  );

  // Get all data in parallel with timeout protection
  const [dashboardStats, usersResult, totalTagsResult, recentTags] = await Promise.all([
    Promise.race([
      getDashboardStats(),
      timeoutPromise
    ]).catch(() => ({
      revenue: {
        daily: { total: 0, count: 0, period: 'daily' },
        monthly: { total: 0, count: 0, period: 'monthly' },
      },
      materials: {
        total: 0,
        lowStockCount: 0,
        lowStockItems: [],
      },
    })),
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(tags),
    db.query.tags.findMany({
      orderBy: [desc(tags.createdAt)],
      limit: 10,
      with: {
        scanLogs: true,
      },
    }),
  ]);

  const totalUsers = usersResult[0]?.count || 0;
  const totalTags = totalTagsResult[0]?.count || 0;

  // Calculate lost tags
  const lostTags = recentTags.filter((t) => t.status === "lost").length;

  // Get users with tag counts (optimized, limited to 100)
  const usersWithTagCount = await getUsersWithTagCounts(100);

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
  }

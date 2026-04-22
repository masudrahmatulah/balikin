import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getUsersWithModulePermissions } from "@/app/actions/admin-module-actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { UserModuleModal } from "@/components/admin/user-module-modal";
import { ModuleAnalyticsCard } from "@/components/admin/module-analytics-card";
import { getModuleDisplayName, getModuleColor, getAllModules } from "@/lib/admin-modules";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import type { User } from "@/db/schema";
import { db } from "@/db";
import { moduleUsageAnalytics } from "@/db/schema";
import { count, eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Modul - Admin",
  description: "Kelola akses modul untuk setiap user",
};

export default async function AdminModulesPage() {
  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/modules");
  }

  // Get all users with their module permissions
  const users = await getUsersWithModulePermissions();

  // Calculate stats
  const totalUsers = users.length;
  const totalActiveModules = users.reduce(
    (sum: number, user: User & { userModulePermissions: any[] }) =>
      sum + user.userModulePermissions.filter((p: any) => p.isEnabled).length,
    0
  );

  // Module stats by type
  const moduleStats = {
    student: users.filter((u: User & { userModulePermissions: any[] }) =>
      u.userModulePermissions.some((p: any) => p.moduleType === "student" && p.isEnabled)
    ).length,
    otomotif: users.filter((u: User & { userModulePermissions: any[] }) =>
      u.userModulePermissions.some((p: any) => p.moduleType === "otomotif" && p.isEnabled)
    ).length,
    pertanian: users.filter((u: User & { userModulePermissions: any[] }) =>
      u.userModulePermissions.some((p: any) => p.moduleType === "pertanian" && p.isEnabled)
    ).length,
    diklat: users.filter((u: User & { userModulePermissions: any[] }) =>
      u.userModulePermissions.some((p: any) => p.moduleType === "diklat" && p.isEnabled)
    ).length,
  };

  // Get analytics data for each module
  const allModules = getAllModules();
  const moduleAnalytics = await Promise.all(
    allModules.map(async (module) => {
      // Get total activations (activate actions)
      const activationResult = await db
        .select({ count: count() })
        .from(moduleUsageAnalytics)
        .where(
          and(
            eq(moduleUsageAnalytics.moduleType, module.type),
            eq(moduleUsageAnalytics.actionType, 'activate')
          )
        );

      // Get active users (currently enabled)
      const activeUsers = moduleStats[module.type] || 0;

      return {
        moduleType: module.type,
        activationCount: activationResult[0]?.count || 0,
        activeUsers,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Manajemen Modul User
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Aktifkan atau nonaktifkan modul untuk setiap user
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total User</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Student Kit</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {moduleStats.student}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Otomotif</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {moduleStats.otomotif}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H9a1 1 0 00-1 1v10a2 2 0 002 2h4a2 2 0 002-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pertanian</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {moduleStats.pertanian}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Module Analytics Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Analytics Modul
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {moduleAnalytics.map((analytics) => (
              <ModuleAnalyticsCard
                key={analytics.moduleType}
                moduleType={analytics.moduleType}
                activationCount={analytics.activationCount}
                activeUsers={analytics.activeUsers}
              />
            ))}
          </div>
        </section>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Daftar User
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Modul Aktif
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.map((user: User & { userModulePermissions: any[] }) => {
                  const activeModules = user.userModulePermissions.filter(
                    (p: any) => p.isEnabled
                  );

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name || "Tanpa Nama"}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {activeModules.length === 0 ? (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                              Tidak ada modul aktif
                            </span>
                          ) : (
                            activeModules.map((permission: any) => (
                              <Badge
                                key={permission.id}
                                className={`${getModuleColor(permission.moduleType)} text-white`}
                              >
                                {getModuleDisplayName(permission.moduleType)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <UserModuleModal
                          userId={user.id}
                          userName={user.name || "Tanpa Nama"}
                          userEmail={user.email}
                          currentPermissions={user.userModulePermissions}
                          onClose={() => {
                            // This will be handled by router.refresh() after modal submit
                          }}
                        >
                          <button
                            type="button"
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Kelola Modul
                          </button>
                        </UserModuleModal>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

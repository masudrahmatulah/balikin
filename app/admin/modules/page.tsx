import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getPendingOrdersCount, getPendingRequestsCount } from "@/lib/admin-stats";
import { getAllModuleConfigs, getModuleStats, initializeDefaultModuleConfigs } from "@/app/actions/module-config-actions";
import { AdminHeader } from "@/components/admin/admin-header";
import { ModuleConfigCard } from "@/components/admin/module-config-card";
import type { Metadata } from "next";
import { MODULES, type ModuleType } from "@/lib/admin-modules";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manajemen Modul - Admin",
  description: "Kelola konfigurasi modul",
};

export default async function AdminModulesPage() {
  // Check if user is admin
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/modules");
  }

  // Get or initialize module configs
  let configs = await getAllModuleConfigs();

  // Initialize default configs if none exist
  if (configs.length === 0) {
    await initializeDefaultModuleConfigs();
    configs = await getAllModuleConfigs();
  }

  // Get stats
  const stats = await getModuleStats();

  // Create a map for easy lookup
  const configMap = new Map(configs.map(c => [c.moduleType, c]));

  // Merge MODULES with configs
  const moduleList = (Object.keys(MODULES) as ModuleType[]).map(moduleType => {
    const config = configMap.get(moduleType);
    const moduleInfo = MODULES[moduleType];

    return {
      moduleType,
      isEnabled: config?.isEnabled ?? true,
      price: config?.price ?? 0,
      isPaid: config?.isPaid ?? false,
      requiresApproval: config?.requiresApproval ?? true,
      description: config?.description ?? moduleInfo.description,
      features: config?.features ? JSON.parse(config.features) : moduleInfo.benefits,
    };
  });

  // Calculate overall stats
  const totalModules = moduleList.length;
  const activeModules = moduleList.filter(m => m.isEnabled).length;
  const totalActiveUsers = stats.reduce((sum, s) => sum + (s.activeUsers || 0), 0);
  const totalPendingOrders = stats.reduce((sum, s) => sum + (s.pendingOrders || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <AdminHeader session={session} pendingOrdersCount={await getPendingOrdersCount()} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Manajemen Modul
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola konfigurasi modul dan harga
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modul</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {activeModules}/{totalModules}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Aktif</p>
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total User Aktif</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {totalActiveUsers}
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {totalPendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {stats.reduce((sum, s) => sum + (s.awaitingVerification || 0), 0)}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <a
            href="/admin/module-orders"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Kelola Order
          </a>
          <a
            href="/admin/requests"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Request Gratis
          </a>
        </div>

        {/* Module Config Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moduleList.map((module) => (
            <ModuleConfigCard
              key={module.moduleType}
              moduleType={module.moduleType}
              isEnabled={module.isEnabled}
              price={module.price}
              isPaid={module.isPaid}
              requiresApproval={module.requiresApproval}
              description={module.description}
              features={module.features}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

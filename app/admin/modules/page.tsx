import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { initializeDefaultModuleConfigs } from "@/app/actions/module-config-actions";
import { ModuleConfigCard } from "@/components/admin/module-config-card";
import type { Metadata } from "next";
import { getModuleListWithStats } from "./data-access";
import { LayoutGrid, Package, Clock, FileCheck } from 'lucide-react';

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

  // Get module data with stats
  const moduleData = await getModuleListWithStats();

  // Initialize default configs if none exist (only on first load)
  if (moduleData.moduleList.length === 0) {
    await initializeDefaultModuleConfigs();
    redirect("/admin/modules");
  }

  const { moduleList, stats } = moduleData;

  // Calculate overall stats
  const totalModules = moduleList.length;
  const activeModules = moduleList.filter(m => m.isEnabled).length;
  const totalActiveUsers = stats.reduce((sum, s) => sum + (s.activeUsers || 0), 0);
  const totalPendingOrders = stats.reduce((sum, s) => sum + (s.pendingOrders || 0), 0);
  const totalAwaitingVerification = stats.reduce((sum, s) => sum + (s.awaitingVerification || 0), 0);

  return (
    <div className="max-w-7xl mx-auto" aria-label="Admin Modules Management">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Manajemen Modul
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola konfigurasi modul dan harga
          </p>
        </header>

        {/* Overview Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" aria-label="Module Statistics">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Modul</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1" aria-label={`${activeModules} dari ${totalModules} modul aktif`}>
                  {activeModules}/{totalModules}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Aktif</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center" aria-hidden="true">
                <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total User Aktif</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1" aria-label={`${totalActiveUsers} user aktif`}>
                  {totalActiveUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center" aria-hidden="true">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1" aria-label={`${totalPendingOrders} order pending`}>
                  {totalPendingOrders}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center" aria-hidden="true">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1" aria-label={`${totalAwaitingVerification} menunggu verifikasi`}>
                  {totalAwaitingVerification}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center" aria-hidden="true">
                <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <nav className="flex gap-4 mb-8" aria-label="Quick Actions">
          <a
            href="/admin/module-orders"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition-colors shadow-sm"
            aria-label="Kelola Order Modul"
          >
            <Package className="w-5 h-5 mr-2" aria-hidden="true" />
            Kelola Order
          </a>
          <a
            href="/admin/requests"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none transition-colors shadow-sm"
            aria-label="Kelola Request Gratis"
          >
            <FileCheck className="w-5 h-5 mr-2" aria-hidden="true" />
            Request Gratis
          </a>
        </nav>

        {/* Module Config Cards */}
        <section aria-label="Module Configurations">
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
        </section>
    </div>
  );
}
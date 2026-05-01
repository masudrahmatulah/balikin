import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { user, userModulePermissions, moduleConfig, modulePurchaseOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveModuleConfigs } from "@/app/actions/module-config-actions";
import { getModuleDisplayName, getModuleColor, type ModuleType } from "@/lib/admin-modules";
import { getModuleCopy } from "@/lib/promo-modules";
import { ModuleCatalogCard } from "@/components/dashboard/module-catalog-card";
import { ModulePromoCard } from "@/components/dashboard/module-promo-card";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modul - Dashboard",
  description: "Jelajahi dan aktifkan modul Balikin",
};

export default async function DashboardModulesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?redirect=/dashboard/modules");
  }

  // Get user's active modules
  const userPermissions = await db.query.userModulePermissions.findMany({
    where: and(
      eq(userModulePermissions.userId, session.user.id),
      eq(userModulePermissions.isEnabled, true)
    ),
  });

  const activeModuleTypes = new Set(userPermissions.map(p => p.moduleType as ModuleType));

  // Get active module configs
  const configs = await getActiveModuleConfigs();

  // Check if user has pending orders
  const pendingOrders = await db.query.modulePurchaseOrders.findMany({
    where: and(
      eq(modulePurchaseOrders.userId, session.user.id),
      eq(modulePurchaseOrders.status, 'pending_payment')
    ),
  });

  const pendingModuleTypes = new Set(pendingOrders.map(o => o.moduleType as ModuleType));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                <Lightbulb className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Tingkatkan Balikin Anda
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                  Modul tambahan untuk memaksimalkan penggunaan Balikin sesuai kebutuhan pribadi atau bisnis Anda.
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Semua modul include:
                </p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notifikasi WA • Support • Update Gratis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Modules Summary */}
        {activeModuleTypes.size > 0 && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Modul Aktif ({activeModuleTypes.size})
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(activeModuleTypes).map(moduleType => (
                <span
                  key={moduleType}
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getModuleColor(moduleType)}`}
                >
                  {getModuleDisplayName(moduleType)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Modules Summary */}
        {activeModuleTypes.size > 0 && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Modul Aktif ({activeModuleTypes.size})
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(activeModuleTypes).map(moduleType => (
                <span
                  key={moduleType}
                  className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getModuleColor(moduleType)}`}
                >
                  {getModuleDisplayName(moduleType)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Module Catalog */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Katalog Modul
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configs.map((config) => {
            const isActive = activeModuleTypes.has(config.moduleType as ModuleType);
            const hasPendingOrder = pendingModuleTypes.has(config.moduleType as ModuleType);
            const features = config.features ? JSON.parse(config.features) : [];

            return (
              <ModulePromoCard
                key={config.moduleType}
                moduleType={config.moduleType as ModuleType}
                isEnabled={config.isEnabled}
                price={config.price}
                isPaid={config.isPaid}
                requiresApproval={config.requiresApproval}
                description={config.description || ''}
                features={features}
                isActive={isActive}
                hasPendingOrder={hasPendingOrder}
              />
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Pertanyaan Umum
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Apakah bisa cancel sewaktu-waktu?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ya, bisa berhenti kapan saja. Tidak ada kontrak jangka panjang yang mengikat Anda.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Apakah ada garansi?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Garansi 7 hari uang kembali jika tidak puas dengan modul yang Anda beli.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Metode pembayaran apa saja?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Kami menerima transfer BCA, QRIS, dan berbagai E-Wallet (GoPay, OVO, Dana).
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Berapa lama proses aktivasinya?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Setelah pembayaran terverifikasi, modul akan aktif dalam maksimal 24 jam jam kerja.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {configs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-slate-600 dark:text-slate-400">
              Belum ada modul yang tersedia saat ini.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

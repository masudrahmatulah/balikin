import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { userModulePermissions, moduleConfig, modulePurchaseOrders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getActiveModuleConfigs } from '@/app/actions/module-config-actions';
import { getModuleDisplayName, getModuleColor, type ModuleType } from '@/lib/admin-modules';
import { getModuleCopy } from '@/lib/promo-modules';
import { ArrowLeft, Lightbulb, HelpCircle, GraduationCap, Car, Leaf, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  otomotif: Car,
  pertanian: Leaf,
  diklat: Users,
};

export default async function MobileModulesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in?redirect=/mobile/modules');
  }

  const userPermissions = await db.query.userModulePermissions.findMany({
    where: and(
      eq(userModulePermissions.userId, session.user.id),
      eq(userModulePermissions.isEnabled, true)
    ),
  });

  const activeModuleTypes = new Set(userPermissions.map(p => p.moduleType as ModuleType));

  const configs = await getActiveModuleConfigs();

  const pendingOrders = await db.query.modulePurchaseOrders.findMany({
    where: and(
      eq(modulePurchaseOrders.userId, session.user.id),
      eq(modulePurchaseOrders.status, 'pending_payment')
    ),
  });

  const pendingModuleTypes = new Set(pendingOrders.map(o => o.moduleType as ModuleType));

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-mobile-primary-light via-mobile-primary to-mobile-primary-dark rounded-3xl p-6 shadow-xl shadow-mobile-primary/30 border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
          </div>

          <div className="relative">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Modul Balikin
            </h1>
            <p className="text-blue-100 text-sm">
              Tingkatkan fitur sesuai kebutuhan Anda
            </p>
          </div>
        </div>

        {/* Active Modules */}
        {activeModuleTypes.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-blue-900 mb-3">
              Modul Aktif ({activeModuleTypes.size})
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(activeModuleTypes).map(moduleType => (
                <span
                  key={moduleType}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${getModuleColor(moduleType)}`}
                >
                  {getModuleDisplayName(moduleType)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Module Catalog */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Katalog Modul</h2>

          {configs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Belum ada modul tersedia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => {
                const isActive = activeModuleTypes.has(config.moduleType as ModuleType);
                const hasPendingOrder = pendingModuleTypes.has(config.moduleType as ModuleType);
                const features = config.features ? JSON.parse(config.features) : [];
                const Icon = moduleIcons[config.moduleType] || Lightbulb;

                return (
                  <div
                    key={config.moduleType}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getModuleColor(config.moduleType)} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {getModuleDisplayName(config.moduleType)}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {config.isPaid ? 'Berbayar' : 'Gratis'}
                              {config.requiresApproval && ' • Perlu Approval'}
                            </p>
                          </div>
                          {isActive && (
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                              Aktif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{config.description}</p>

                    {features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Fitur:</p>
                        <ul className="space-y-1">
                          {features.map((feature: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-mobile-primary rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-lg font-bold text-gray-900">
                        {config.price > 0 ? `Rp ${config.price.toLocaleString('id-ID')}` : 'Gratis'}
                      </p>

                      {isActive ? (
                        <span className="text-sm text-emerald-600 font-medium">Sedang Aktif</span>
                      ) : hasPendingOrder ? (
                        <span className="text-sm text-amber-600 font-medium">Menunggu Pembayaran</span>
                      ) : (
                        <button className="bg-mobile-primary text-white px-4 py-2 rounded-xl text-sm font-semibold btn-press">
                          {config.isPaid ? 'Beli' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">FAQ</h2>
          </div>

          <div className="space-y-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Bisa cancel sewaktu-waktu?
              </h3>
              <p className="text-xs text-gray-600">
                Ya, bisa berhenti kapan saja tanpa kontrak jangka panjang
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Ada garansi?
              </h3>
              <p className="text-xs text-gray-600">
                Garansi 7 hari uang kembali jika tidak puas
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Berapa lama proses aktivasi?
              </h3>
              <p className="text-xs text-gray-600">
                Maksimal 24 jam setelah pembayaran terverifikasi
              </p>
            </div>
          </div>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

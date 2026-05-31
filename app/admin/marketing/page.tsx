import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import dynamicImport from "next/dynamic";
import { Link } from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Target,
  BarChart3,
  Megaphone,
  ArrowRight,
  Plus
} from "lucide-react";

export const dynamic = "force-dynamic";

// FIXED: Lazy load MarketingDashboard to reduce initial bundle size
// This component contains heavy recharts library (~120KB)
// Note: ssr: false is not allowed in Server Components, so we load it client-side only
const MarketingDashboard = dynamicImport(
  () => import("@/components/admin/marketing-dashboard").then(mod => ({ default: mod.MarketingDashboard })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

export default async function MarketingDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/marketing");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Marketing Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview dari performa marketing, konversi, dan analytics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Pengguna</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                1,234
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                +12% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Conversions */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Konversi Premium</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                8.5%
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                +2.3% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                Rp 45.2M
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                +23% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Finder to Buyer */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Finder→Buyer</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                15.2%
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                +5.1% dari bulan lalu
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/marketing/analytics">
            <Button className="w-full gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics Lengkap
            </Button>
          </Link>
          <Link href="/admin/marketing/campaigns">
            <Button variant="outline" className="w-full gap-2">
              <Campaign className="w-4 h-4" />
              Kelola Campaign
            </Button>
          </Link>
          <Link href="/admin/bundles">
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Buat Bundle Baru
            </Button>
          </Link>
          <Link href="/admin/tier-management">
            <Button variant="outline" className="w-full gap-2">
              <TrendingUp className="w-4 h-4" />
              Tier Management
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Marketing Dashboard Component */}
      <MarketingDashboard />

      {/* Conversion Highlights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Highlight Konversi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Performing Module */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="font-semibold text-yellow-900 dark:text-yellow-100">Top Module</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              Student Kit
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              60% dari total aktivasi modul
            </p>
          </div>

          {/* Best Conversion Time */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <span className="font-semibold text-green-900 dark:text-green-100">Best Time</span>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              19:00 - 21:00
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Jam konversi tertinggi
            </p>
          </div>

          {/* Highest Conversion Channel */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📱</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Top Channel</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              WhatsApp
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              45% dari total konversi
            </p>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
              Insight Mingguan
            </h3>
            <ul className="text-sm text-indigo-800 dark:text-indigo-200 mt-2 space-y-1">
              <li>• Konversi Free-to-Premium meningkat 8.5% berkat campaign bundling</li>
              <li>• Module Student Kit tetap menjadi primadona dengan 60% aktivasi</li>
              <li>• Finder-to-Buyer conversion mencapai 15.2%, naik dari 10.1% bulan lalu</li>
              <li>• Peak conversion time: 19:00-21:00 WITA (jam kerja berakhir)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { stickerOrders, moduleRequests, user } from "@/db/schema";
import { desc, count, eq, and } from "drizzle-orm";
import { Link } from "next/link";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Users,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Plus,
  Eye
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CSDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/cs");
  }

  // Get pending payments count
  const pendingPaymentsResult = await db
    .select({ count: count() })
    .from(stickerOrders)
    .where(eq(stickerOrders.paymentStatus, "pending"));

  const pendingPaymentsCount = pendingPaymentsResult[0]?.count || 0;

  // Get recent sticker orders (last 5)
  const recentOrders = await db.query.stickerOrders.findMany({
    where: eq(stickerOrders.paymentStatus, "pending"),
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: true,
    },
    limit: 5,
  });

  // Get module requests summary
  const moduleRequestsResult = await db
    .select({
      total: count(),
      pending: count(),
    })
    .from(moduleRequests);

  const totalModuleRequests = moduleRequestsResult[0]?.total || 0;
  const pendingModuleRequests = moduleRequestsResult[0]?.pending || 0;

  // Get recent module requests (last 5)
  const recentRequests = await db.query.moduleRequests.findMany({
    orderBy: [desc(moduleRequests.createdAt)],
    with: {
      user: true,
    },
    limit: 5,
  });

  // Get total users count
  const totalUsersResult = await db.select({ count: count() }).from(user);
  const totalUsers = totalUsersResult[0]?.count || 0;

  // Calculate total pending amount
  const totalPendingAmount = recentOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Customer Service Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview dari layanan pelanggan dan verifikasi pembayaran
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pembayaran Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {pendingPaymentsCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Total Pending Amount */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai Pending</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Rp {totalPendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Module Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Request Modul</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {totalModuleRequests}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pengguna</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {totalUsers}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/cs/payments">
            <Button className="w-full gap-2">
              <CreditCard className="w-4 h-4" />
              Verifikasi Pembayaran
              {pendingPaymentsCount > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingPaymentsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline" className="w-full gap-2">
              <Users className="w-4 h-4" />
              Kelola Klien
            </Button>
          </Link>
          <Link href="/admin/sticker-orders">
            <Button variant="outline" className="w-full gap-2">
              <ShoppingCart className="w-4 h-4" />
              Sticker Orders
            </Button>
          </Link>
          <Link href="/admin/requests">
            <Button variant="outline" className="w-full gap-2">
              <MessageSquare className="w-4 h-4" />
              Request Modul
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pembayaran Pending Terbaru</h2>
            <Link href="/admin/cs/payments">
              <Button variant="outline" size="sm" className="gap-2">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Tidak ada pembayaran pending</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.recipientName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        {order.paymentStatus.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {order.productType} × {order.packQuantity} packs
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.user?.name || order.user?.email || "Unknown user"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rp {order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Module Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Request Modul Terbaru</h2>
            <Link href="/admin/requests">
              <Button variant="outline" size="sm" className="gap-2">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada request modul</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.moduleType}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        request.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : request.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.user?.name || request.user?.email || "Unknown user"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert for High Pending Count */}
      {pendingPaymentsCount > 10 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Banyak Pembayaran Pending
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Ada {pendingPaymentsCount} pembayaran yang menunggu verifikasi. Segera verifikasi untuk menghindari keterlambatan pengiriman.
              </p>
              <Link href="/admin/cs/payments">
                <Button size="sm" className="mt-3 gap-2">
                  Verifikasi Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import {
  getCSDashboard,
  getCSModuleRequestsSummary,
} from './data-access';
import { revalidatePath } from 'next/cache';
import { Link } from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Users,
  MessageSquare,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default async function CSDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/cs');
  }

  const { pendingPaymentsCount, recentOrders, moduleRequestsSummary, recentRequests } = await getCSDashboard();

  const totalModuleRequests = moduleRequestsSummary.total;
  const pendingModuleRequests = moduleRequestsSummary.pending;

  const totalPendingAmount = recentOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Customer Service Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Overview dari layanan pelanggan dan verifikasi pembayaran
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="list" aria-label="Dashboard statistics">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pembayaran Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2" aria-live="polite">
                {pendingPaymentsCount}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Nilai Pending</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                Rp {totalPendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Request Modul</p>
              <p className="text-3xl font-bold text-purple-600 mt-2" aria-live="polite">
                {totalModuleRequests}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" role="listitem">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Pengguna</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                -
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="list">
          <Link href="/admin/sticker-orders" role="listitem">
            <Button className="w-full gap-2" aria-label={`Verifikasi ${pendingPaymentsCount} pembayaran pending`}>
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              Verifikasi Pembayaran
              {pendingPaymentsCount > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingPaymentsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin" role="listitem">
            <Button variant="outline" className="w-full gap-2" aria-label="Kelola klien">
              <Users className="w-4 h-4" aria-hidden="true" />
              Kelola Klien
            </Button>
          </Link>
          <Link href="/admin/sticker-orders" role="listitem">
            <Button variant="outline" className="w-full gap-2" aria-label="Lihat sticker orders">
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              Sticker Orders
            </Button>
          </Link>
          <Link href="/admin/requests" role="listitem">
            <Button variant="outline" className="w-full gap-2" aria-label="Lihat request modul">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Request Modul
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pembayaran Pending Terbaru</h2>
            <Link href="/admin/sticker-orders">
              <Button variant="outline" size="sm" className="gap-2" aria-label="Lihat semua pembayaran pending">
                Lihat Semua
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>Tidak ada pembayaran pending</p>
            </div>
          ) : (
            <div className="space-y-3" role="list">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
                  role="listitem"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.recipientName}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        aria-label={`Status pembayaran: ${order.paymentStatus}`}
                      >
                        {order.paymentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {order.productType} × {order.packQuantity} packs
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.user?.name || order.user?.email || 'Unknown user'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rp {order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Request Modul Terbaru</h2>
            <Link href="/admin/requests">
              <Button variant="outline" size="sm" className="gap-2" aria-label="Lihat semua request modul">
                Lihat Semua
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>Belum ada request modul</p>
            </div>
          ) : (
            <div className="space-y-3" role="list">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
                  role="listitem"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.moduleType}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : request.status === 'approved'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                        aria-label={`Status request: ${request.status}`}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.user?.name || request.user?.email || 'Unknown user'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {pendingPaymentsCount > 10 && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Banyak Pembayaran Pending
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                Ada {pendingPaymentsCount} pembayaran yang menunggu verifikasi. Segera verifikasi untuk menghindari keterlambatan pengiriman.
              </p>
              <Link href="/admin/sticker-orders">
                <Button size="sm" className="mt-3 gap-2">
                  Verifikasi Sekarang
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserModulePurchaseOrders } from "@/app/actions/module-purchase-actions";
import { getModuleDisplayName, getModuleColor, type ModuleType } from "@/lib/admin-modules";
import { UploadPaymentProof } from "@/components/dashboard/upload-payment-proof";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Saya - Dashboard",
  description: "Kelola order pembelian modul",
};

export default async function DashboardPurchasesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?redirect=/dashboard/modules/purchases");
  }

  const orders = await getUserModulePurchaseOrders();

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
  };

  const statusLabels: Record<string, string> = {
    pending_payment: 'Menunggu Pembayaran',
    paid: 'Menunggu Verifikasi',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Order Saya
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kelola order pembelian modul Anda
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Belum ada order pembelian modul
              </p>
              <a
                href="/dashboard/modules"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Jelajahi Modul
              </a>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {getModuleDisplayName(order.moduleType as ModuleType)}
                    </h3>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                      <span>Nominal: <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.amount)}</span></span>
                      <span>Dibuat: {formatDate(order.requestedAt)}</span>
                      {order.paidAt && <span>Dibayar: {formatDate(order.paidAt)}</span>}
                    </div>

                    {order.rejectionReason && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Alasan penolakan: {order.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {order.status === 'pending_payment' && (
                      <UploadPaymentProof orderId={order.id} />
                    )}

                    {order.status === 'paid' && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        ✓ Menunggu verifikasi admin
                      </div>
                    )}

                    {order.status === 'approved' && (
                      <a
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Buka Dashboard
                      </a>
                    )}

                    {order.status === 'rejected' && (
                      <a
                        href="/dashboard/modules"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Order Lagi
                      </a>
                    )}
                  </div>
                </div>

                {/* Payment Proof (if uploaded) */}
                {order.paymentProofUrl && order.status === 'paid' && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Bukti pembayaran telah diupload:
                    </p>
                    <a
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Lihat bukti pembayaran
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Payment Instructions */}
        {orders.some(o => o.status === 'pending_payment') && (
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              Instruksi Pembayaran
            </h3>
            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <p>Transfer ke rekening berikut:</p>
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 mt-2">
                <p><span className="font-medium">Bank:</span> BCA</p>
                <p><span className="font-medium">Nomor Rekening:</span> 1234567890</p>
                <p><span className="font-medium">Atas Nama:</span> Balikin Indonesia</p>
              </div>
              <p className="mt-2">Setelah transfer, upload bukti pembayaran pada order di atas.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from '@/lib/session';
import { getUserModulePurchaseOrders } from "@/app/actions/module-purchase-actions";
import { getModuleDisplayName, type ModuleType } from "@/lib/admin-modules";
import Link from "next/link";
import { ArrowLeft, Package, Upload, Check, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending_payment: 'bg-mobile-warning-lighter text-mobile-warning',
  paid: 'bg-mobile-info-lighter text-mobile-info',
  approved: 'bg-mobile-success-lighter text-mobile-success',
  rejected: 'bg-mobile-danger-lighter text-mobile-danger',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  pending_payment: 'Menunggu Bayar',
  paid: 'Menunggu Verifikasi',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
};

export default async function MobileModulePurchasesPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/sign-in?redirect=/mobile/modules/purchases");
  }

  const orders = await getUserModulePurchaseOrders();

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile/modules">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Saya</h1>
          <p className="text-sm text-gray-600">Kelola order pembelian modul</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Belum ada order pembelian modul</p>
            <Link href="/mobile/modules" className="block">
              <div className="inline-block bg-mobile-primary text-white px-6 py-3 rounded-xl font-medium">
                Jelajahi Modul
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-500">
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>

                {/* Order Details */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getModuleDisplayName(order.moduleType as ModuleType)}
                  </h3>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Nominal: <span className="font-semibold text-gray-900">{formatPrice(order.amount)}</span></p>
                    <p>Dibuat: {formatDate(order.requestedAt)}</p>
                    {order.paidAt && <p>Dibayar: {formatDate(order.paidAt)}</p>}
                  </div>

                  {order.rejectionReason && (
                    <p className="mt-2 text-sm text-mobile-danger">
                      Alasan: {order.rejectionReason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100">
                  {order.status === 'pending_payment' && (
                    <Link href={`/mobile/modules/purchases/${order.id}/upload-proof`} className="block">
                      <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press flex items-center justify-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Bukti Bayar
                      </div>
                    </Link>
                  )}

                  {order.status === 'paid' && (
                    <div className="bg-mobile-info-lighter text-mobile-info py-3 rounded-xl text-center flex items-center justify-center gap-2">
                      <Check className="h-5 w-5" />
                      <span className="text-sm font-medium">Menunggu verifikasi admin</span>
                    </div>
                  )}

                  {order.status === 'approved' && (
                    <Link href="/mobile" className="block">
                      <div className="bg-mobile-success text-white py-3 rounded-xl text-center font-semibold btn-press">
                        Buka Modul
                      </div>
                    </Link>
                  )}

                  {order.status === 'rejected' && (
                    <Link href="/mobile/modules" className="block">
                      <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press">
                        Order Lagi
                      </div>
                    </Link>
                  )}
                </div>

                {/* Payment Proof */}
                {order.paymentProofUrl && order.status === 'paid' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-mobile-primary hover:underline flex items-center gap-1"
                    >
                      <Package className="h-4 w-4" />
                      Lihat bukti pembayaran
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Payment Instructions */}
        {orders.some(o => o.status === 'pending_payment') && (
          <div className="bg-mobile-info-lighter border border-mobile-info-lighter rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-mobile-info mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instruksi Pembayaran
            </h3>
            <div className="space-y-2 text-sm text-mobile-info">
              <p>Transfer ke rekening berikut:</p>
              <div className="bg-white/80 rounded-xl p-4 mt-2">
                <p><span className="font-medium">Bank:</span> BCA</p>
                <p><span className="font-medium">No. Rekening:</span> 1234567890</p>
                <p><span className="font-medium">Atas Nama:</span> Balikin Indonesia</p>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}

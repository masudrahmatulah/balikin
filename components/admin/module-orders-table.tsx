'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getModuleDisplayName, getModuleColor } from '@/lib/admin-modules';
import {
  approveModulePurchaseOrder,
  rejectModulePurchaseOrder,
  cancelModulePurchaseOrder,
} from '@/app/actions/module-purchase-actions';
import { Check, X, Eye, Send } from 'lucide-react';
import Image from 'next/image';

interface ModuleOrder {
  id: string;
  userId: string;
  moduleType: string;
  status: 'pending_payment' | 'paid' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  paymentProofUrl: string | null;
  requestedAt: Date;
  paidAt: Date | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  user: {
    name: string | null;
    email: string;
  };
}

interface ModuleOrdersTableProps {
  orders: ModuleOrder[];
  initialFilter?: string;
}

export function ModuleOrdersTable({ orders, initialFilter = 'all' }: ModuleOrdersTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const statusColors: Record<string, string> = {
    pending_payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
  };

  const statusLabels: Record<string, string> = {
    pending_payment: 'Menunggu Pembayaran',
    paid: 'Menunggu Verifikasi',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
  };

  const handleApprove = async (orderId: string) => {
    setProcessing(orderId);
    try {
      await approveModulePurchaseOrder(orderId);
      router.refresh();
    } catch (error) {
      console.error('Failed to approve order:', error);
      alert('Gagal menyetujui order');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Alasan penolakan (opsional):');
    if (reason === null) return; // User cancelled

    setProcessing(orderId);
    try {
      await rejectModulePurchaseOrder({ orderId, rejectionReason: reason || undefined });
      router.refresh();
    } catch (error) {
      console.error('Failed to reject order:', error);
      alert('Gagal menolak order');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Batalkan order ini?')) return;

    setProcessing(orderId);
    try {
      await cancelModulePurchaseOrder(orderId);
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Gagal membatalkan order');
    } finally {
      setProcessing(null);
    }
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
    <>
      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Order</SelectItem>
            <SelectItem value="pending_payment">Menunggu Pembayaran</SelectItem>
            <SelectItem value="paid">Menunggu Verifikasi</SelectItem>
            <SelectItem value="approved">Disetujui</SelectItem>
            <SelectItem value="rejected">Ditolak</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
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
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'Tidak ada order' : `Tidak ada order dengan status: ${statusLabels[filter]}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Modul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nominal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.user.name || 'Tanpa Nama'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getModuleColor(order.moduleType)} text-white`}>
                        {getModuleDisplayName(order.moduleType)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'paid' && (
                          <>
                            {order.paymentProofUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrderId(order.id)}
                                className="h-8"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Bukti
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(order.id)}
                              disabled={processing === order.id}
                              className="h-8 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {processing === order.id ? '...' : 'Setuju'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(order.id)}
                              disabled={processing === order.id}
                              className="h-8"
                            >
                              <X className="w-3 h-3 mr-1" />
                              {processing === order.id ? '...' : 'Tolak'}
                            </Button>
                          </>
                        )}
                        {order.status === 'pending_payment' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(order.id)}
                            disabled={processing === order.id}
                            className="h-8"
                          >
                            <X className="w-3 h-3 mr-1" />
                            {processing === order.id ? '...' : 'Batalkan'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {selectedOrderId && (
        <PaymentProofModal
          orderId={selectedOrderId}
          orders={orders}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </>
  );
}

function PaymentProofModal({
  orderId,
  orders,
  onClose,
}: {
  orderId: string;
  orders: ModuleOrder[];
  onClose: () => void;
}) {
  const order = orders.find(o => o.id === orderId);

  if (!order || !order.paymentProofUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bukti Pembayaran
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Order ID:</span> #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">User:</span> {order.user.name || 'Tanpa Nama'} ({order.user.email})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Nominal:</span>{' '}
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(order.amount)}
            </p>
          </div>
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
            <Image
              src={order.paymentProofUrl}
              alt="Bukti Pembayaran"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

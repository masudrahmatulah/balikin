'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getModuleDisplayName, getModuleColor, type ModuleType } from '@/lib/admin-modules';
import { createModulePurchaseOrder } from '@/app/actions/module-purchase-actions';
import { requestModule } from '@/app/actions/module-request-actions';
import { Check, ShoppingCart, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ModuleCatalogCardProps {
  moduleType: ModuleType;
  isEnabled: boolean;
  price: number;
  isPaid: boolean;
  requiresApproval: boolean;
  description: string;
  features: string[];
  isActive: boolean;
  hasPendingOrder: boolean;
}

export function ModuleCatalogCard({
  moduleType,
  isEnabled,
  price,
  isPaid,
  requiresApproval,
  description,
  features,
  isActive,
  hasPendingOrder,
}: ModuleCatalogCardProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; amount: number } | null>(null);

  const moduleColor = getModuleColor(moduleType);
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

  const handleRequestFree = async () => {
    setProcessing(true);
    try {
      await requestModule({ moduleType, reason: 'Request modul gratis' });
      alert('Permintaan modul berhasil dikirim! Menunggu persetujuan admin.');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Gagal mengirim permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      const result = await createModulePurchaseOrder(moduleType);
      if (result.success && result.order) {
        setCreatedOrder({ id: result.order.id, amount: result.order.amount });
        setOrderModalOpen(true);
      }
    } catch (error: any) {
      alert(error.message || 'Gagal membuat order');
    } finally {
      setProcessing(false);
    }
  };

  const getActionState = () => {
    if (isActive) return 'active';
    if (hasPendingOrder) return 'pending';
    if (!isEnabled) return 'disabled';
    return isPaid ? 'purchase' : 'request';
  };

  const actionState = getActionState();

  return (
    <>
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 transition-all overflow-hidden ${
        isActive
          ? 'border-green-200 dark:border-green-900'
          : !isEnabled
          ? 'border-slate-200 dark:border-slate-700 opacity-60'
          : 'border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900'
      }`}>
        {/* Header */}
        <div className={`p-4 ${moduleColor} bg-opacity-10`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 ${moduleColor} rounded-lg flex items-center justify-center`}>
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            {isActive && (
              <Badge className="bg-green-600 text-white">
                <Check className="w-3 h-3 mr-1" />
                Aktif
              </Badge>
            )}
            {!isEnabled && (
              <Badge className="bg-slate-500 text-white">
                Tidak Tersedia
              </Badge>
            )}
            {hasPendingOrder && (
              <Badge className="bg-yellow-500 text-white">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {getModuleDisplayName(moduleType)}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Price */}
          <div className="mb-4">
            {isPaid ? (
              <div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formattedPrice}
                </span>
                {requiresApproval && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Butuh verifikasi admin setelah pembayaran
                  </p>
                )}
              </div>
            ) : (
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                GRATIS
              </span>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <ul className="space-y-2 mb-4">
              {features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action Button */}
          <Button
            className="w-full"
            disabled={processing || !isEnabled || isActive || hasPendingOrder}
            onClick={
              actionState === 'purchase'
                ? handlePurchase
                : actionState === 'request'
                ? handleRequestFree
                : undefined
            }
            variant={
              actionState === 'active' ? 'outline' :
              actionState === 'disabled' ? 'secondary' :
              actionState === 'pending' ? 'secondary' :
              'default'
            }
          >
            {processing ? 'Memproses...' :
             actionState === 'active' ? 'Sudah Aktif' :
             actionState === 'disabled' ? 'Tidak Tersedia' :
             actionState === 'pending' ? 'Menunggu Pembayaran' :
             actionState === 'purchase' ? (
               <>
                 <ShoppingCart className="w-4 h-4 mr-2" />
                 Beli Sekarang
               </>
             ) : (
               'Request Gratis'
             )}
          </Button>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Berhasil Dibuat!</DialogTitle>
            <DialogDescription>
              Silakan selesaikan pembayaran untuk mengaktifkan modul
            </DialogDescription>
          </DialogHeader>

          {createdOrder && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Order ID:</span> #{createdOrder.id.slice(0, 8)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Modul:</span> {getModuleDisplayName(moduleType)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Nominal:</span>{' '}
                  <span className="text-lg font-bold text-blue-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(createdOrder.amount)}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Cara Pembayaran:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-slate-600 dark:text-slate-400">
                  <li>Transfer ke BCA 1234567890 a.n Balikin Indonesia</li>
                  <li>Upload bukti pembayaran di halaman My Orders</li>
                  <li>Tunggu verifikasi admin (maksimal 24 jam)</li>
                </ol>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderModalOpen(false)}>
              Tutup
            </Button>
            <Button onClick={() => router.push('/dashboard/modules/purchases')}>
              Ke Halaman Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

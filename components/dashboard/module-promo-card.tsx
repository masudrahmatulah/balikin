'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getModuleDisplayName, getModuleColor, type ModuleType } from '@/lib/admin-modules';
import { getModuleCopy } from '@/lib/promo-modules';
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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModulePromoCardProps {
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

/**
 * Enhanced module card with PAS (Problem-Agitate-Solution) copywriting
 * Designed for higher conversion on the modules page
 */
export function ModulePromoCard({
  moduleType,
  isEnabled,
  price,
  isPaid,
  requiresApproval,
  description,
  features,
  isActive,
  hasPendingOrder,
}: ModulePromoCardProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; amount: number } | null>(null);

  const moduleColor = getModuleColor(moduleType);
  const copy = getModuleCopy(moduleType);
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
      <Card
        className={cn(
          'overflow-hidden transition-all hover:shadow-lg',
          isActive
            ? 'border-2 border-green-200 dark:border-green-900'
            : !isEnabled
            ? 'border-2 border-slate-200 dark:border-slate-700 opacity-60'
            : 'border-2 border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900'
        )}
      >
        {/* Header with PAS Problem Statement */}
        <div className={cn('p-6', moduleColor.replace('bg-', 'bg-opacity-10 bg-'))}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0',
              moduleColor
            )}>
              <span className="text-2xl">{copy.emoji}</span>
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

          {/* PAS Headline - Problem */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
            {copy.headline}
          </h3>

          {/* PAS Subheadline - Agitation + Solution */}
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            {copy.subheadline}
          </p>
        </div>

        {/* Content */}
        <CardContent className="p-6">
          {/* Benefits List */}
          <ul className="space-y-3 mb-6">
            {copy.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Price & CTA */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-4">
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

            <Button
              className="w-full"
              size="lg"
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
        </CardContent>
      </Card>

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

'use client';

import { useState, useEffect } from 'react';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { initiatePayment } from '@/app/actions/payment';
import { AlertCircle, Loader2 } from 'lucide-react';
import { NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, MIDTRANS_SNAP_URL } from '@/lib/constants';

interface PaymentSectionProps {
  orderId: string;
  paymentStatus: string;
  totalAmount: number;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: unknown) => void;
    };
  }
}

export function PaymentSection({ orderId, paymentStatus, totalAmount }: PaymentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = MIDTRANS_SNAP_URL;
    script.async = true;
    script.setAttribute('data-client-key', NEXT_PUBLIC_MIDTRANS_CLIENT_KEY);
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap');
      setError('Gagal memuat gateway pembayaran');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!isLoaded) {
      setError('Gateway pembayaran sedang dimuat...');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await initiatePayment({ orderId });
        if (result.success && window.snap) {
          window.snap.pay(result.token, {
            onSuccess: () => {
              // Payment successful - page will auto-refresh via webhook
              alert('Pembayaran berhasil! Silakan tunggu verifikasi admin.');
              window.location.reload();
            },
            onPending: () => {
              alert('Pembayaran sedang diproses...');
            },
            onError: () => {
              setError('Pembayaran dibatalkan atau terjadi kesalahan');
            },
            onClose: () => {
              setError('Modal pembayaran ditutup');
            },
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pembayaran';
        setError(message);
      }
    });
  };

  // Already paid
  if (paymentStatus === 'paid') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="text-sm font-semibold text-green-950">✓ Pembayaran Berhasil</p>
        <p className="mt-2 text-sm leading-6 text-green-800">
          Pembayaran Anda telah diverifikasi. Admin sedang menyiapkan bundle sticker. Anda akan menerima update melalui WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <p className="text-sm font-semibold text-blue-950">💳 Pembayaran dengan QRIS Midtrans</p>
      <p className="mt-2 text-sm leading-6 text-blue-800">
        Klik tombol di bawah untuk membuka modal pembayaran QRIS. Scan QR Code dengan e-wallet favorit Anda (GoPay, OVO, LinkAja, dll).
      </p>

      {error && (
        <div className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Button
          onClick={handlePayment}
          disabled={isPending || !isLoaded}
          className="w-full bg-blue-600 hover:bg-blue-700"
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Membuka...
            </>
          ) : (
            `Bayar Rp${totalAmount.toLocaleString('id-ID')}`
          )}
        </Button>
        <p className="text-xs text-blue-700 text-center">
          {!isLoaded ? 'Mempersiapkan gateway pembayaran...' : 'Gateway pembayaran siap'}
        </p>
      </div>
    </div>
  );
}

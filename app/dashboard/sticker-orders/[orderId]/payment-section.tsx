'use client';

import { useState, useTransition } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { initiatePayment } from '@/app/actions/payment';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface PaymentSectionProps {
  orderId: string;
  paymentStatus: string;
  totalAmount: number;
}

export function PaymentSection({ orderId, paymentStatus, totalAmount }: PaymentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);

  const handlePayment = () => {
    setError(null);
    setQrString(null);
    startTransition(async () => {
      try {
        const result = await initiatePayment({ orderId });
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        if (result.qrString) {
          setQrString(result.qrString);
          return;
        }
        setError('Gagal mendapatkan halaman pembayaran.');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat pembayaran';
        setError(message);
      }
    });
  };

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

  if (qrString) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-950">💳 Pembayaran QRIS</p>
        <div className="mt-3 flex justify-center rounded-2xl bg-white p-4">
          <QRCodeSVG value={qrString} size={180} />
        </div>
        <p className="mt-3 text-xs leading-6 text-blue-800">
          Scan QRIS di atas dengan e-wallet atau m-banking Anda. Status pembayaran diperbarui otomatis setelah konfirmasi dari gateway.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <p className="text-sm font-semibold text-blue-950">💳 Pembayaran dengan QRIS</p>
      <p className="mt-2 text-sm leading-6 text-blue-800">
        Klik tombol di bawah untuk membuka pembayaran QRIS. Scan QR Code dengan e-wallet favorit Anda (GoPay, OVO, LinkAja, dll).
      </p>

      {error && (
        <div className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-4">
        <Button
          onClick={handlePayment}
          disabled={isPending}
          className="w-full bg-blue-600 hover:bg-blue-700"
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Membuka pembayaran...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Bayar Rp{totalAmount.toLocaleString('id-ID')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
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
  paymentProofUrl?: string | null;
  isPrintable?: boolean;
}

export function PaymentSection({ orderId, paymentStatus, totalAmount, paymentProofUrl, isPrintable }: PaymentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePayment = () => {
    setError(null);
    setQrString(null);
    startTransition(async () => {
      try {
        const result = await initiatePayment({ orderId });
        if (result.qrString) {
          setQrString(result.qrString);
          return;
        }
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
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
      <div className="rounded-2xl border border-green-300 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/40">
        <p className="text-sm font-semibold text-green-950 dark:text-green-100">✓ Pembayaran Berhasil</p>
        <p className="mt-2 text-sm leading-6 text-green-900 dark:text-green-200">
          Pembayaran Anda telah diverifikasi. Admin sedang menyiapkan bundle sticker. Anda akan menerima update melalui WhatsApp.
        </p>
      </div>
    );
  }

  if (isPrintable) {
    async function uploadProof(file: File) {
      setUploading(true); setError(null);
      try {
        const form = new FormData(); form.append('file', file); form.append('orderId', orderId);
        const response = await fetch('/api/upload/payment-proof', { method: 'POST', body: form });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload bukti pembayaran gagal');
        window.location.reload();
      } catch (err) { setError(err instanceof Error ? err.message : 'Upload bukti pembayaran gagal'); }
      finally { setUploading(false); }
    }

    return (
      <div className="rounded-2xl border border-blue-300 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/40">
        <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">Pembayaran QRIS Manual</p>
        <img src="/images/qris-gopay.svg" alt="QRIS Balikin" className="mx-auto my-4 h-48 w-48 rounded-xl bg-white p-2" />
        <p className="text-center text-sm font-semibold text-blue-950 dark:text-blue-100">Rp{totalAmount.toLocaleString('id-ID')}</p>
        <p className="mt-2 text-xs leading-5 text-blue-900 dark:text-blue-200">Scan QRIS, lalu upload bukti pembayaran. Admin akan memverifikasi order Anda.</p>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <label className="mt-4 block cursor-pointer rounded-lg border border-blue-300 bg-white px-3 py-2 text-center text-sm font-medium text-blue-700">
          {uploading ? 'Mengupload...' : paymentProofUrl ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadProof(event.target.files[0])} />
        </label>
      </div>
    );
  }

  if (qrString) {
    return (
      <div className="rounded-2xl border border-blue-300 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/40">
        <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">💳 Pembayaran QRIS</p>
        <div className="mt-3 flex justify-center rounded-2xl border border-blue-200 bg-white p-4">
          <QRCodeSVG value={qrString} size={180} />
        </div>
        <p className="mt-3 text-xs leading-6 text-blue-950 dark:text-blue-200">
          Scan QRIS di atas dengan e-wallet atau m-banking Anda. Status pembayaran diperbarui otomatis setelah konfirmasi dari gateway.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-300 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/40">
      <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">💳 Pembayaran dengan QRIS</p>
      <p className="mt-2 text-sm leading-6 text-blue-950 dark:text-blue-200">
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

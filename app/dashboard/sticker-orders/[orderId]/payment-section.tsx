'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

interface PaymentSectionProps {
  orderId: string;
  paymentStatus: string;
  totalAmount: number;
  paymentProofUrl?: string | null;
  activationBatchId?: string | null;
}

export function PaymentSection({ orderId, paymentStatus, totalAmount, paymentProofUrl, activationBatchId }: PaymentSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (paymentStatus === 'paid') {
    return (
      <div className="rounded-2xl border border-green-300 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/40">
        <p className="text-sm font-semibold text-green-950 dark:text-green-100">✓ Pembayaran Berhasil</p>
        {activationBatchId && (
          <div className="mt-4 rounded-xl border border-green-200 bg-white p-3 text-center dark:border-green-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-green-950 dark:text-green-100">QR Aktivasi Paket</p>
            <div className="mt-3 flex justify-center">
              <QRCodeSVG value={`/activate/batch/${activationBatchId}`} size={190} includeMargin />
            </div>
            <p className="mt-2 text-xs text-green-800 dark:text-green-200">Scan QR ini, lalu masukkan kode klaim dari buku petunjuk untuk mengaktifkan seluruh paket.</p>
          </div>
        )}
        <p className="mt-2 text-sm leading-6 text-green-900 dark:text-green-200">
          Pembayaran Anda telah diverifikasi. Admin sedang menyiapkan bundle sticker. Anda akan menerima update melalui WhatsApp.
        </p>
      </div>
    );
  }

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
        <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">Pembayaran QRIS GoPay</p>
        <Image src="/images/qris-gopay-manual.jpeg" alt="QRIS GoPay untuk pembayaran Balikin" width={600} height={800} className="mx-auto my-4 max-h-[26rem] w-full max-w-xs rounded-xl bg-white object-contain p-2" />
        <p className="text-center text-sm font-semibold text-blue-950 dark:text-blue-100">Rp{totalAmount.toLocaleString('id-ID')}</p>
          <p className="mt-2 text-xs leading-5 text-blue-900 dark:text-blue-200">Scan QRIS di atas, masukkan nominal persis seperti total pesanan, lalu upload bukti pembayaran. Pembayaran tetap pending sampai diverifikasi manual admin/CS.</p>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <label className="mt-4 block cursor-pointer rounded-lg border border-blue-300 bg-white px-3 py-2 text-center text-sm font-medium text-blue-700">
          {uploading ? 'Mengupload...' : paymentProofUrl ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadProof(event.target.files[0])} />
        </label>
      </div>
  );
}

'use client';

import { useState } from 'react';
import { CheckCircle2, MessageCircle, Upload } from 'lucide-react';

interface MobileQrisPaymentProps {
  orderId: string;
  amount: number;
  paymentProofUrl?: string | null;
  whatsappHref: string;
}

export function MobileQrisPayment({ orderId, amount, paymentProofUrl, whatsappHref }: MobileQrisPaymentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(Boolean(paymentProofUrl));
  const [error, setError] = useState<string | null>(null);

  const uploadProof = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);

      const response = await fetch('/api/upload/payment-proof', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload bukti pembayaran gagal.');
      setHasUploaded(true);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload bukti pembayaran gagal.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-mobile-info-lighter bg-white/90 p-5 shadow-lg">
      <h2 className="text-lg font-bold text-gray-900">Bayar dengan QRIS GoPay</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Scan QRIS, lalu masukkan nominal tepat seperti total pesanan berikut.
      </p>
      <img
        src="/images/qris-gopay-manual.jpeg"
        alt="QRIS GoPay untuk pembayaran Balikin"
        className="mx-auto my-4 max-h-[28rem] w-full max-w-xs rounded-xl bg-white object-contain"
      />
      <p className="text-center text-xl font-bold text-gray-900">Rp{amount.toLocaleString('id-ID')}</p>
      <p className="mt-2 text-center text-xs text-gray-500">Pastikan nama merchant yang tampil sesuai dengan QRIS sebelum membayar.</p>

      <label className="mt-5 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-mobile-primary px-4 py-3 text-center font-semibold text-white transition-opacity hover:opacity-90">
        {hasUploaded ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        {isUploading ? 'Mengupload bukti…' : hasUploaded ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadProof(file);
            event.currentTarget.value = '';
          }}
        />
      </label>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <p className="mt-4 text-center text-xs leading-5 text-gray-600">Pembayaran akan diproses setelah admin memverifikasi bukti transfer Anda.</p>
      {hasUploaded && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mobile-success px-4 py-3 text-center font-semibold text-white">
          <MessageCircle className="h-5 w-5" />
          Kirim konfirmasi via WhatsApp
        </a>
      )}
    </section>
  );
}

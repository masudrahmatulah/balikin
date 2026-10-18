'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initiateTagUpgradePayment } from '@/app/actions/tag-upgrade';
import { PREMIUM_UPGRADE_PRICE } from '@/lib/constants';

export function TagUpgradeButton({ tagId }: { tagId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ id: string; amount: number; proofUrl: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpgrade = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await initiateTagUpgradePayment(tagId);
        setOrder({ id: result.orderId, amount: result.amount, proofUrl: result.paymentProofUrl });
      } catch (upgradeError) {
        setError(upgradeError instanceof Error ? upgradeError.message : 'Gagal membuat pembayaran.');
      }
    });
  };

  async function uploadProof(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('orderId', order!.id);
      const response = await fetch('/api/upload/payment-proof', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload bukti pembayaran gagal');
      setOrder({ ...order!, proofUrl: data.url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload bukti pembayaran gagal');
    } finally {
      setUploading(false);
    }
  }

  if (order) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold">QRIS GoPay — Rp{order.amount.toLocaleString('id-ID')}</p>
        <Image src="/images/qris-gopay-manual.jpeg" alt="QRIS GoPay untuk pembayaran Balikin" width={600} height={800} className="max-h-80 w-full max-w-xs rounded-xl bg-white object-contain p-2" />
        <p className="text-xs leading-5 text-amber-800">Bayar dengan nominal persis di atas, lalu unggah bukti. Status upgrade menunggu verifikasi manual admin/CS.</p>
        {order.proofUrl && <p className="text-xs text-green-700">Bukti pembayaran sudah diunggah; menunggu verifikasi.</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm">
          {uploading ? 'Mengupload...' : order.proofUrl ? 'Ganti bukti pembayaran' : 'Upload bukti pembayaran'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadProof(event.target.files[0])} />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        onClick={handleUpgrade}
        disabled={isPending}
        className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isPending ? 'Menyiapkan pembayaran...' : `Upgrade Rp${PREMIUM_UPGRADE_PRICE.toLocaleString('id-ID')}`}
      </Button>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

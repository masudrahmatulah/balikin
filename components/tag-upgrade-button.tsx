'use client';

import { useState, useTransition } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initiateTagUpgradePayment } from '@/app/actions/tag-upgrade';
import { PREMIUM_UPGRADE_PRICE } from '@/lib/constants';

export function TagUpgradeButton({ tagId }: { tagId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [qrString, setQrString] = useState<string | null>(null);

  const handleUpgrade = () => {
    setError(null);
    setQrString(null);
    startTransition(async () => {
      try {
        const result = await initiateTagUpgradePayment(tagId);
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return;
        }
        if (result.qrString) {
          setQrString(result.qrString);
          return;
        }
        setError('Gagal mendapatkan halaman pembayaran.');
      } catch (upgradeError) {
        setError(upgradeError instanceof Error ? upgradeError.message : 'Gagal membuat pembayaran.');
      }
    });
  };

  if (qrString) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm">
          <QRCodeSVG value={qrString} size={160} />
        </div>
        <p className="text-xs leading-5 text-amber-800">
          Scan QRIS ini dengan e-wallet atau m-banking Anda. Status tag diperbarui otomatis setelah pembayaran dikonfirmasi.
        </p>
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
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
        {isPending ? 'Membuka pembayaran...' : `Upgrade Rp${PREMIUM_UPGRADE_PRICE.toLocaleString('id-ID')}`}
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
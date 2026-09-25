import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActivationMaterialDownloads({
  qrDataUrl,
  manifest,
}: {
  qrDataUrl?: string;
  manifest?: string;
}) {
  if (!qrDataUrl || !manifest) return null;

  const manifestUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(manifest)}`;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <p className="mb-1 font-medium text-blue-950 dark:text-blue-100">Bahan aktivasi untuk buku petunjuk</p>
      <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
        QR ini sama untuk seluruh batch. Cetak kode dari daftar pada insert masing-masing paket.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild type="button" size="sm" variant="outline">
          <a href={qrDataUrl} download="balikin-qr-aktivasi-batch.png">
            <QrCode className="mr-2 h-4 w-4" /> Download QR Aktivasi
          </a>
        </Button>
        <Button asChild type="button" size="sm" variant="outline">
          <a href={manifestUrl} download="balikin-kode-klaim-batch.txt">
            <Download className="mr-2 h-4 w-4" /> Download Daftar Kode Paket
          </a>
        </Button>
      </div>
    </div>
  );
}

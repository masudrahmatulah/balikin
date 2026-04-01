'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { generateBundlePDF } from '@/app/actions/sticker-pdf';
import { getShapeLabel, getSizeLabel, type StickerShape, type StickerSize } from '@/lib/sticker-template';

interface PrintBundleButtonProps {
  bundleId: string;
  bundleIndex?: number;
  stickerShape?: StickerShape;
  stickerSize?: StickerSize;
}

export function PrintBundleButton({ bundleId, bundleIndex, stickerShape = 'circle', stickerSize = 'medium' }: PrintBundleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pdfDataUrl = await generateBundlePDF(bundleId);

      // Extract base64 data from data URL
      const base64Data = pdfDataUrl.split(',')[1];

      // Convert to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `balikin-${stickerShape}-${stickerSize}-bundle-${bundleIndex ?? '1'}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Gagal generate PDF';
      setError(errMsg);
      console.error('Error generating PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handlePrint}
        disabled={isLoading}
        size="sm"
        variant="default"
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Print PDF
          </>
        )}
      </Button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}

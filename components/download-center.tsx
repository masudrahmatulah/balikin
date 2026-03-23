'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ImageIcon, Smartphone } from 'lucide-react';

interface DownloadCenterProps {
  tagName: string;
  slug: string;
  qrDataUrl: string;
  tier?: string | null;
}

function createRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function DownloadCenter({ tagName, slug, qrDataUrl, tier }: DownloadCenterProps) {
  const [isDownloading, setIsDownloading] = useState<'square' | 'wallpaper' | null>(null);
  const isFree = !tier || tier === 'free';

  const downloadFile = async (mode: 'square' | 'wallpaper') => {
    setIsDownloading(mode);

    try {
      const qrImage = await loadImage(qrDataUrl);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas tidak tersedia');
      }

      if (mode === 'square') {
        canvas.width = 1080;
        canvas.height = 1080;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#eff6ff');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 54px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Balikin', canvas.width / 2, 110);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(tagName, canvas.width / 2, 180);

        ctx.fillStyle = '#475569';
        ctx.font = '30px sans-serif';
        ctx.fillText('Scan saya jika menemukan barang ini', canvas.width / 2, 235);

        createRoundedRect(ctx, 170, 290, 740, 620, 40);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(37, 99, 235, 0.12)';
        ctx.shadowBlur = 40;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.drawImage(qrImage, 260, 350, 560, 560);

        ctx.fillStyle = '#64748b';
        ctx.font = '24px sans-serif';
        ctx.fillText(`balikin.id/p/${slug}`, canvas.width / 2, 955);

        if (isFree) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('Protected by Balikin Free', canvas.width / 2, 1010);
        }
      } else {
        canvas.width = 1170;
        canvas.height = 2532;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.45, '#1d4ed8');
        gradient.addColorStop(1, '#e0f2fe');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(1040, 220, 180, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(140, 2280, 220, 0, Math.PI * 2);
        ctx.fill();

        createRoundedRect(ctx, 95, 220, 980, 1820, 52);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 58px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Balikin', canvas.width / 2, 350);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('Digital Tag Darurat', canvas.width / 2, 430);

        ctx.fillStyle = '#475569';
        ctx.font = '32px sans-serif';
        ctx.fillText('Gunakan sebagai lockscreen atau cetak mandiri', canvas.width / 2, 495);

        createRoundedRect(ctx, 215, 610, 740, 820, 44);
        ctx.fillStyle = '#eff6ff';
        ctx.fill();
        ctx.drawImage(qrImage, 265, 670, 640, 640);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(tagName, canvas.width / 2, 1545);

        ctx.fillStyle = '#64748b';
        ctx.font = '28px sans-serif';
        ctx.fillText('Scan saya jika menemukan HP / barang ini', canvas.width / 2, 1615);
        ctx.fillText(`balikin.id/p/${slug}`, canvas.width / 2, 1700);

        ctx.fillStyle = '#1e293b';
        ctx.font = '30px sans-serif';
        ctx.fillText('Hubungi pemilik dengan aman via WhatsApp', canvas.width / 2, 1835);

        if (isFree) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 28px sans-serif';
          ctx.fillText('Protected by Balikin Free', canvas.width / 2, 1970);
        }
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `balikin-${slug}-${mode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to create asset:', error);
      alert('Gagal membuat aset digital.');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">Download Center</p>
            {isFree && (
              <Badge variant="outline" className="border-blue-200 bg-white text-blue-700">
                Digital Tag Free
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Pilih aset QR digital untuk DIY: gambar kotak standar atau wallpaper lockscreen siap pakai.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="h-auto justify-start whitespace-normal border-blue-200 bg-white px-4 py-4 text-left hover:bg-blue-50"
          onClick={() => downloadFile('square')}
          disabled={isDownloading !== null}
        >
          <div className="flex min-w-0 items-start gap-3">
            <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <p className="break-words whitespace-normal font-medium text-slate-950">Unduh QR Code Kotak</p>
              <p className="mt-1 break-words whitespace-normal text-xs leading-5 text-slate-600">
                Cocok untuk cetak mandiri, laptop, buku, atau label darurat.
              </p>
            </div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto justify-start whitespace-normal border-blue-200 bg-white px-4 py-4 text-left hover:bg-blue-50"
          onClick={() => downloadFile('wallpaper')}
          disabled={isDownloading !== null}
        >
          <div className="flex min-w-0 items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="min-w-0 flex-1">
              <p className="break-words whitespace-normal font-medium text-slate-950">Unduh Wallpaper HP</p>
              <p className="mt-1 break-words whitespace-normal text-xs leading-5 text-slate-600">
                Layout lockscreen dengan branding Balikin dan QR yang siap digunakan.
              </p>
            </div>
          </div>
        </Button>
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Download className="h-3.5 w-3.5" />
        {isFree ? 'Aset free menyertakan watermark kecil Balikin Free.' : 'Aset premium tampil lebih bersih tanpa watermark free.'}
      </p>
    </div>
  );
}

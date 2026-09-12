'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';

export interface CropAspectOption {
  label: string;
  /** width / height. null = bebas */
  ratio: number | null;
}

/** Preset aspek kotak logo VDP akrilik (lib/acrylic-shapes.ts) */
export const VDP_CROP_ASPECTS: CropAspectOption[] = [
  { label: 'Emboss 2:3', ratio: 2 / 3 },
  { label: 'Persegi 1:1', ratio: 1 },
  { label: 'Oval 26:33', ratio: 26 / 33 },
  { label: 'Bebas', ratio: null },
];

const STAGE_W = 340;
const STAGE_H = 300;
const OUTPUT_LONG_SIDE = 1200;

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  aspects?: CropAspectOption[];
  defaultAspectIndex?: number;
  onComplete: (blob: Blob) => void;
}

export function ImageCropper({
  open,
  onOpenChange,
  imageUrl,
  aspects = VDP_CROP_ASPECTS,
  defaultAspectIndex = 0,
  onComplete,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [aspectIndex, setAspectIndex] = useState(defaultAspectIndex);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const aspect = aspects[aspectIndex]?.ratio ?? null;

  // Muat gambar saat URL berubah
  useEffect(() => {
    if (!open || !imageUrl) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setAspectIndex(defaultAspectIndex);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = imageUrl;
    return () => {
      imgRef.current = null;
    };
  }, [open, imageUrl, defaultAspectIndex]);

  const fitScale = imgSize.w > 0 ? Math.max(STAGE_W / imgSize.w, STAGE_H / imgSize.h) : 1;
  const scale = fitScale * zoom;

  // Kotak crop: terbesar yang muat di stage sesuai aspek
  const cropBox = (() => {
    if (!aspect) return { x: 20, y: 20, w: STAGE_W - 40, h: STAGE_H - 40 };
    let w = STAGE_W - 40;
    let h = w / aspect;
    if (h > STAGE_H - 40) {
      h = STAGE_H - 40;
      w = h * aspect;
    }
    return { x: (STAGE_W - w) / 2, y: (STAGE_H - h) / 2, w, h };
  })();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || imgSize.w === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, STAGE_W, STAGE_H);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    const dw = imgSize.w * scale;
    const dh = imgSize.h * scale;
    const dx = (STAGE_W - dw) / 2 + offset.x;
    const dy = (STAGE_H - dh) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, dw, dh);

    // Masker gelap di luar kotak crop
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, STAGE_W, cropBox.y);
    ctx.fillRect(0, cropBox.y + cropBox.h, STAGE_W, STAGE_H - cropBox.y - cropBox.h);
    ctx.fillRect(0, cropBox.y, cropBox.x, cropBox.h);
    ctx.fillRect(cropBox.x + cropBox.w, cropBox.y, STAGE_W - cropBox.x - cropBox.w, cropBox.h);

    // Bingkai crop
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.setLineDash([]);
  }, [imgSize, scale, offset, cropBox.x, cropBox.y, cropBox.w, cropBox.h]);

  useEffect(() => {
    draw();
  }, [draw]);

  const toCanvasCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * STAGE_W,
      y: ((e.clientY - rect.top) / rect.height) * STAGE_H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = toCanvasCoords(e);
    dragRef.current = { x: p.x, y: p.y, ox: offset.x, oy: offset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toCanvasCoords(e);
    setOffset({ x: drag.ox + (p.x - drag.x), y: drag.oy + (p.y - drag.y) });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleDone = async () => {
    const img = imgRef.current;
    if (!img || imgSize.w === 0 || processing) return;
    setProcessing(true);
    try {
      // Petakan kotak crop ke koordinat gambar asli
      const dw = imgSize.w * scale;
      const dh = imgSize.h * scale;
      const dx = (STAGE_W - dw) / 2 + offset.x;
      const dy = (STAGE_H - dh) / 2 + offset.y;
      const sx = Math.max(0, (cropBox.x - dx) / scale);
      const sy = Math.max(0, (cropBox.y - dy) / scale);
      const sw = Math.min(imgSize.w - sx, cropBox.w / scale);
      const sh = Math.min(imgSize.h - sy, cropBox.h / scale);

      // Output: sisi panjang OUTPUT_LONG_SIDE, jaga aspek
      const outScale = OUTPUT_LONG_SIDE / Math.max(sw, sh);
      const outW = Math.max(1, Math.round(sw * outScale));
      const outH = Math.max(1, Math.round(sh * outScale));

      const out = document.createElement('canvas');
      out.width = outW;
      out.height = outH;
      const octx = out.getContext('2d');
      if (!octx) throw new Error('Canvas tidak didukung');
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, outW, outH);
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob = await new Promise<Blob | null>((resolve) =>
        out.toBlob(resolve, 'image/jpeg', 0.92)
      );
      if (!blob) throw new Error('Gagal memproses gambar');
      onComplete(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-label="Potong gambar">
        <DialogHeader>
          <DialogTitle>Sesuaikan Gambar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih rasio potong">
            {aspects.map((a, i) => (
              <Button
                key={a.label}
                type="button"
                size="sm"
                variant={i === aspectIndex ? 'default' : 'outline'}
                onClick={() => setAspectIndex(i)}
              >
                {a.label}
              </Button>
            ))}
          </div>

          <canvas
            ref={canvasRef}
            width={STAGE_W}
            height={STAGE_H}
            className="w-full cursor-move touch-none rounded-lg"
            style={{ aspectRatio: `${STAGE_W}/${STAGE_H}` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            aria-label="Area potong: geser gambar untuk mengatur posisi"
          />

          <div className="space-y-2">
            <Label htmlFor="crop-zoom">Zoom</Label>
            <Slider
              id="crop-zoom"
              min={1}
              max={4}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Geser gambar untuk mengatur posisi. Hasil crop otomatis diskala ke sisi panjang {OUTPUT_LONG_SIDE}px (JPEG).
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
            Batal
          </Button>
          <Button type="button" onClick={handleDone} disabled={processing || imgSize.w === 0}>
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              'Potong & Gunakan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

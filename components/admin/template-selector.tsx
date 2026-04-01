'use client';

import { Circle, Square, RectangleHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type StickerShape, type StickerSize, getShapeLabel, getSizeLabel } from '@/lib/sticker-template';

interface TemplateSelectorProps {
  selectedShape: StickerShape;
  selectedSize: StickerSize;
  onShapeChange: (shape: StickerShape) => void;
  onSizeChange: (size: StickerSize) => void;
}

const SHAPES: { value: StickerShape; icon: React.ReactNode; label: string }[] = [
  { value: 'circle', icon: <Circle className="h-8 w-8" />, label: 'Bulat' },
  { value: 'square', icon: <Square className="h-8 w-8" />, label: 'Segi Empat' },
  { value: 'rectangle', icon: <RectangleHorizontal className="h-8 w-8" />, label: 'Persegi Panjang' },
];

const SIZES: { value: StickerSize; label: string; mm: number }[] = [
  { value: 'small', label: 'Kecil', mm: 30 },
  { value: 'medium', label: 'Sedang', mm: 40 },
  { value: 'large', label: 'Besar', mm: 50 },
];

export function TemplateSelector({
  selectedShape,
  selectedSize,
  onShapeChange,
  onSizeChange,
}: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template Sticker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shape Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bentuk Sticker
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SHAPES.map((shape) => (
              <Button
                key={shape.value}
                type="button"
                variant={selectedShape === shape.value ? 'default' : 'outline'}
                onClick={() => onShapeChange(shape.value)}
                className="flex h-auto flex-col gap-2 p-4"
              >
                {shape.icon}
                <span className="text-xs">{shape.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Ukuran Sticker
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((size) => (
              <Button
                key={size.value}
                type="button"
                variant={selectedSize === size.value ? 'default' : 'outline'}
                onClick={() => onSizeChange(size.value)}
                className="flex h-auto flex-col gap-1 p-3"
              >
                <span className="text-sm font-medium">{size.label}</span>
                <span className="text-xs opacity-70">{size.mm}mm</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Preview Summary */}
        <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Template terpilih:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {getShapeLabel(selectedShape)} • {getSizeLabel(selectedSize)}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

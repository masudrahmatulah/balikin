'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Layers, ShoppingCart, Sticker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickerColorPicker } from '@/components/sticker-color-picker';
import { DEFAULT_STICKER_COLOR_THEME, type StickerColorTheme } from '@/lib/sticker-color-themes';
import type { ProductKey } from '@/lib/product-catalog';

interface Composition {
  summary: string;
  breakdown: { label: string; size: string; count: number }[] | null;
}

interface StickerPurchaseCardProps {
  product: { name: string; price: number; packSize: number };
  productKey: Exclude<ProductKey, 'armor-tag' | 'ultimate-pack' | 'paket-keluarga' | 'paket-traveller'>;
  useCase: string;
  composition: Composition;
  isPopular: boolean;
}

export function StickerPurchaseCard({
  product,
  productKey,
  useCase,
  composition,
  isPopular,
}: StickerPurchaseCardProps) {
  const [color, setColor] = useState<StickerColorTheme>(DEFAULT_STICKER_COLOR_THEME);

  return (
    <Card id={productKey} className={`relative bg-white dark:bg-white/5 transition-all ${isPopular ? 'border-2 border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/40' : 'border-2 border-gray-200 dark:border-white/10'}`}>
      {isPopular && (
        <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Paling Populer
        </span>
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl dark:text-white">
          <Sticker className="h-5 w-5 flex-shrink-0 text-indigo-600" aria-hidden="true" />
          {product.name} Isi {product.packSize}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{useCase}</p>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" aria-hidden="true" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium">{composition.summary}</p>
              {composition.breakdown && (
                <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {composition.breakdown.map((item) => (
                    <li key={item.label} className="flex justify-between gap-2">
                      <span className="flex items-center gap-1"><Check className="h-3 w-3 text-indigo-500" aria-hidden="true" />{item.count}x {item.label}</span>
                      <span className="font-mono">{item.size}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <StickerColorPicker value={color} onChange={setColor} compact />

        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Rp{product.price.toLocaleString('id-ID')}</p>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600">
            <Link href={`/stickers/checkout?product=${productKey}&color=${color}`}><ShoppingCart className="mr-2 h-4 w-4" />Pilih Paket</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

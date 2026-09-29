'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { setAcrylicStock } from '@/app/admin/production/product-stock/actions';

export interface ProductStockRow {
  productVariant: string;
  label: string;
  quantityOnHand: number;
  lowStockThreshold: number;
}

export function ProductStockManager({ rows }: { rows: ProductStockRow[] }) {
  const [values, setValues] = useState(() => Object.fromEntries(rows.map((row) => [row.productVariant, String(row.quantityOnHand)])));
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (productVariant: string) => {
    setError(null);
    setSaved(null);
    const quantity = Number(values[productVariant]);
    startTransition(async () => {
      try {
        await setAcrylicStock(productVariant, quantity);
        setSaved(productVariant);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan stok');
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => {
          const quantity = Number(values[row.productVariant]);
          const isLow = quantity <= row.lowStockThreshold;
          return (
            <Card key={row.productVariant} className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-2 text-base dark:text-white">
                  <Package className="mt-0.5 h-4 w-4 text-purple-600" aria-hidden="true" />
                  {row.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">Stok saat ini</span>
                  <span className={isLow ? 'font-semibold text-amber-700 dark:text-amber-300' : 'font-semibold text-emerald-700 dark:text-emerald-300'}>{quantity} pcs</span>
                </div>
                <Input type="number" min={0} max={100000} value={values[row.productVariant]} onChange={(event) => setValues((current) => ({ ...current, [row.productVariant]: event.target.value }))} aria-label={`Stok ${row.label}`} />
                <Button className="w-full" size="sm" disabled={isPending} onClick={() => handleSave(row.productVariant)}>
                  {isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : saved === row.productVariant ? <Check className="mr-1.5 h-4 w-4" aria-hidden="true" /> : null}
                  {saved === row.productVariant ? 'Tersimpan' : 'Simpan Stok'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

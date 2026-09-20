'use client';

import { useState, useTransition } from 'react';
import { createCoupons, toggleCoupon } from '@/app/actions/admin-coupon-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Coupon = Awaited<ReturnType<typeof import('@/app/actions/admin-coupon-actions').getCoupons>>[number];

export function CouponGenerator({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');

  function submit(formData: FormData) {
    setError('');
    setResult([]);
    startTransition(async () => {
      const response = await createCoupons({
        prefix: String(formData.get('prefix') || 'BALIKIN'),
        count: Number(formData.get('count') || 1),
        discountType: type,
        discountValue: Number(formData.get('discountValue') || 0),
        maxUses: Number(formData.get('maxUses') || 1),
        expiresAt: String(formData.get('expiresAt') || ''),
      });
      if (response.error) setError(response.error);
      if (response.codes) setResult(response.codes);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,400px)_1fr]">
      <form action={submit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div><Label htmlFor="prefix">Prefix kode</Label><Input id="prefix" name="prefix" defaultValue="BALIKIN" maxLength={10} className="mt-1 uppercase" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="count">Jumlah</Label><Input id="count" name="count" type="number" min="1" max="100" defaultValue="1" className="mt-1" /></div>
          <div><Label htmlFor="maxUses">Maks. pemakaian</Label><Input id="maxUses" name="maxUses" type="number" min="1" defaultValue="1" className="mt-1" /></div>
        </div>
        <div><Label htmlFor="discountType">Tipe diskon</Label><select id="discountType" value={type} onChange={(event) => setType(event.target.value as typeof type)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="percentage">Persentase (%)</option><option value="fixed">Nominal (Rp)</option></select></div>
        <div><Label htmlFor="discountValue">Nilai diskon</Label><Input id="discountValue" name="discountValue" type="number" min="1" max={type === 'percentage' ? 100 : undefined} required className="mt-1" /></div>
        <div><Label htmlFor="expiresAt">Berlaku sampai (opsional)</Label><Input id="expiresAt" name="expiresAt" type="datetime-local" className="mt-1" /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full">{isPending ? 'Membuat...' : 'Generate Coupon'}</Button>
        {result.length > 0 && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="mb-2 text-sm font-semibold text-emerald-800">Coupon berhasil dibuat</p><code className="block whitespace-pre-wrap break-all text-sm text-emerald-900">{result.join('\n')}</code></div>}
      </form>

      <div className="rounded-2xl border bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b p-5 dark:border-slate-700"><h2 className="font-semibold">Coupon tersimpan</h2><p className="text-sm text-muted-foreground">Kelola kode yang sudah dibuat.</p></div>
        <div className="divide-y dark:divide-slate-700">
          {initialCoupons.length === 0 && <p className="p-5 text-sm text-muted-foreground">Belum ada coupon.</p>}
          {initialCoupons.map((coupon) => <div key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><code className="font-semibold break-all">{coupon.code}</code><p className="text-xs text-muted-foreground">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `Rp ${coupon.discountValue.toLocaleString('id-ID')}`} · {coupon.usedCount}/{coupon.maxUses} digunakan</p></div><Switch checked={coupon.isActive} onCheckedChange={(checked) => startTransition(() => { toggleCoupon(coupon.id, checked); })} aria-label={`Aktifkan ${coupon.code}`} /></div>)}
        </div>
      </div>
    </div>
  );
}

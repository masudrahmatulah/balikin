'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPrintableOrder, type PrintablePackage } from '@/app/actions/printable-order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PrintableOrderForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [packageKey, setPackageKey] = useState<PrintablePackage>('single');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function uploadLogo(file: File) {
    setUploading(true); setError('');
    try {
      const data = new FormData(); data.append('file', file);
      const response = await fetch('/api/upload/printable-logo', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload logo gagal');
      setLogoUrl(result.url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload logo gagal'); }
    finally { setUploading(false); }
  }

  function submit(formData: FormData) {
    setError('');
    startTransition(async () => {
      try {
        const result = await createPrintableOrder({ packageKey, recipientName: String(formData.get('recipientName')), phone: String(formData.get('phone')), logoUrl: logoUrl || undefined });
        router.push(`/dashboard/sticker-orders/${result.orderId}`);
      } catch (err) { setError(err instanceof Error ? err.message : 'Order gagal dibuat'); }
    });
  }

  return <form action={submit} className="space-y-5">
    <div><Label htmlFor="package">Paket</Label><select id="package" value={packageKey} onChange={(event) => setPackageKey(event.target.value as PrintablePackage)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="single">Single · Rp35.000</option><option value="five">5 tag · Rp125.000</option><option value="ten">10 tag · Rp200.000</option></select></div>
    <div><Label htmlFor="recipientName">Nama pemilik/tag</Label><Input id="recipientName" name="recipientName" required placeholder="Nama Anda atau nama bisnis" /></div>
    <div><Label htmlFor="phone">Nomor WhatsApp</Label><Input id="phone" name="phone" required placeholder="628123456789" /></div>
    <div><Label htmlFor="logo">Logo custom (opsional)</Label><Input id="logo" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadLogo(event.target.files[0])} /><p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP maksimal 2MB. {logoUrl ? 'Logo berhasil diupload.' : ''}</p></div>
    {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button type="submit" disabled={pending || uploading} className="w-full bg-brand-red hover:bg-brand-red-dark">{pending ? 'Membuat order...' : 'Buat Order Printable'}</Button>
  </form>;
}

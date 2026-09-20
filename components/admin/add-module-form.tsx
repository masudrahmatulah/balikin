'use client';

import { useState, useTransition } from 'react';
import { createModuleConfig } from '@/app/actions/module-config-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AddModuleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function submit(formData: FormData) {
    setError('');
    startTransition(async () => {
      try {
        await createModuleConfig({
          moduleType: String(formData.get('moduleType') || ''),
          displayName: String(formData.get('displayName') || ''),
          description: String(formData.get('description') || ''),
          features: String(formData.get('features') || '')
            .split(',')
            .map((feature) => feature.trim())
            .filter(Boolean),
          price: Number(formData.get('price') || 0),
          isPaid: formData.get('isPaid') === 'on',
          requiresApproval: formData.get('requiresApproval') === 'on',
          isEnabled: true,
          sortOrder: Number(formData.get('sortOrder') || 0),
        });
        setOpen(false);
        router.refresh();
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Gagal menambahkan modul.');
      }
    });
  }

  return (
    <section className="mb-8 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 p-5 dark:border-blue-800 dark:bg-blue-950/20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">Tambah Modul Katalog</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Buat modul baru untuk ditampilkan di katalog. Modul ini belum memiliki form data khusus.</p>
        </div>
        <Button type="button" onClick={() => setOpen((value) => !value)} variant={open ? 'outline' : 'default'}>
          <Plus className="mr-2 h-4 w-4" />
          {open ? 'Tutup Form' : 'Tambah Modul'}
        </Button>
      </div>

      {open && (
        <form action={submit} className="mt-5 grid gap-4 border-t border-blue-200 pt-5 dark:border-blue-900 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="moduleType">Slug Modul</Label>
            <Input id="moduleType" name="moduleType" placeholder="contoh: properti" required pattern="[a-z0-9][a-z0-9_-]{1,49}" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Nama Modul</Label>
            <Input id="displayName" name="displayName" placeholder="Contoh: Modul Properti" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" name="description" placeholder="Jelaskan manfaat modul ini." rows={2} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="features">Fitur (pisahkan dengan koma)</Label>
            <Textarea id="features" name="features" placeholder="Fitur 1, Fitur 2, Fitur 3" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Harga (Rupiah)</Label>
            <Input id="price" name="price" type="number" min="0" defaultValue="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Urutan</Label>
            <Input id="sortOrder" name="sortOrder" type="number" min="0" defaultValue="0" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="isPaid" className="h-4 w-4" /> Modul berbayar
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="requiresApproval" defaultChecked className="h-4 w-4" /> Perlu approval admin
          </label>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <Button type="submit" disabled={isPending} className="sm:col-span-2">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Modul Katalog
          </Button>
        </form>
      )}
    </section>
  );
}

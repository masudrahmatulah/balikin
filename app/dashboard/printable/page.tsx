import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileImage, ShieldCheck } from 'lucide-react';
import { getSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintableOrderForm } from './printable-order-form';

export const dynamic = 'force-dynamic';

export default async function PrintableOrderPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect('/sign-in?redirect=/dashboard/printable');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Dashboard</Button></Link>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileImage className="h-5 w-5 text-brand-red" />Printable QR Tag</CardTitle>
            <CardDescription>Pesan lisensi QR yang dapat dicetak sendiri. Tag dibuat setelah pembayaran diverifikasi admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3"><p className="font-semibold">Single</p><p className="text-sm text-slate-500">Rp35.000 · 1 tag</p></div>
              <div className="rounded-xl border p-3"><p className="font-semibold">Paket 5</p><p className="text-sm text-slate-500">Rp125.000 · 5 tag</p></div>
              <div className="rounded-xl border p-3"><p className="font-semibold">Paket 10</p><p className="text-sm text-slate-500">Rp200.000 · 10 tag</p></div>
            </div>
            <PrintableOrderForm />
            <p className="mt-5 flex items-start gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0" />QR aktif selamanya. Pembayaran menggunakan QRIS manual dan diverifikasi admin.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

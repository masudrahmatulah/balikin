import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';

export default function ScanPage() {
  return <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white py-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
    <div className="mx-auto max-w-2xl space-y-6 px-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-red"><ArrowLeft className="h-4 w-4" />Kembali ke Dashboard</Link>
      <header><h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Scan QR Tag</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Arahkan kamera ke QR Balikin. Penemu dapat membuka profil publik; pemilik dapat meneruskan aktivasi tag.</p></header>
      <QrScanner />
    </div>
  </main>;
}

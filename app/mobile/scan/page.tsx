import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QrScanner } from '@/components/qr-scanner';

export default function MobileScanPage() {
  return <main className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to py-5">
    <div className="mx-auto max-w-xl space-y-5">
      <div className="px-4"><Link href="/mobile" className="inline-flex items-center gap-2 text-mobile-primary"><ArrowLeft className="h-5 w-5" />Kembali</Link></div>
      <h1 className="px-4 text-2xl font-bold text-gray-900">Scan QR Tag</h1>
      <QrScanner mobile />
    </div>
  </main>;
}

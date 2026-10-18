import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, ZapOff, Infinity as InfinityIcon, Lock } from 'lucide-react';
import { BRAND_DESCRIPTION, BRAND_TAGLINE } from '@/lib/brand';

const licenseHighlights = [
  { icon: Lock, label: 'Proteksi Data Diri' },
  { icon: ZapOff, label: 'Bebas Baterai' },
  { icon: InfinityIcon, label: 'Berlaku Seumur Hidup' },
];

export function SmartLicenseHeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 text-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-red/10 blur-3xl dark:bg-brand-red/20" />
        <div className="absolute top-20 left-10 opacity-10 h-24 w-24 text-brand-red" aria-hidden="true"><ShieldCheck /></div>
        <div className="absolute top-40 right-20 opacity-10 h-32 w-32 text-brand-red" aria-hidden="true"><Lock /></div>
        <div className="absolute bottom-20 left-1/4 opacity-10 h-28 w-28 text-brand-navy dark:text-white" aria-hidden="true"><InfinityIcon /></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-red-50 text-brand-red-dark px-4 py-2 rounded-full text-sm font-medium mb-6 dark:from-brand-red/20 dark:to-brand-red/5 dark:text-red-300 border border-brand-red/20">
          <ShieldCheck className="h-4 w-4" />
          Bukan Gantungan Kunci. Ini Sistem Proteksi Digital.
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight dark:text-white">
          {BRAND_TAGLINE}
        </h1>

        <p className="mx-auto mb-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-300">
          {BRAND_DESCRIPTION}
        </p>

        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto dark:text-gray-300">
          Anda tidak sedang membeli akrilik atau stiker. Anda mengaktifkan{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">lisensi proteksi digital</span> — nomor HP Anda tidak tercetak di barang, tanpa baterai, dan berlaku seumur hidup.
        </p>

        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto dark:text-gray-400">
          Gantungan akrilik, logam, atau stiker hanyalah <span className="font-semibold text-gray-700 dark:text-gray-300">media fisik</span> — wadah yang membawa teknologi digital ini ke mana pun barang Anda pergi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <div className="max-w-md mx-auto text-center">
            <Link href="/produk">
              <Button
                size="lg"
                className="text-lg px-8 py-6 w-full sm:w-auto bg-gradient-to-r from-[#ff2938] to-[#d90f1d] hover:from-[#e50d1c] hover:to-[#b90d19] border-0 text-white shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/40 transition-all"
              >
                Produk Mulai Rp35.000
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all" asChild>
            <Link href="#simulator-qr">Lihat Cara Kerjanya</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {licenseHighlights.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white shadow-sm border rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <Icon className="h-4 w-4 text-brand-red" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

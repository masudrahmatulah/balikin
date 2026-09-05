'use client';

import Link from 'next/link';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Gift, UserPlus, QrCode, Tags, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Daftar & Login',
    desc: 'Cukup 1 menit pakai Google atau email. Tanpa kartu kredit, tanpa biaya tersembunyi.',
  },
  {
    icon: QrCode,
    title: 'Klaim 1 Tag QR Gratis',
    desc: 'Langsung tersedia di dashboard Anda — siap dipakai kapan saja.',
  },
  {
    icon: Tags,
    title: 'Pasang di Barang Favorit',
    desc: 'Tempel di dompet, tas, atau kunci. Rasakan sendiri sistemnya bekerja.',
  },
];

export function FreePassLeadSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            Balikin Free Pass
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            1 Tag QR Gratis, Cuma Butuh Daftar & Login
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Tidak perlu beli dulu untuk membuktikan sistemnya bekerja. Buat akun sekarang,
            dan 1 tag QR digital langsung jadi milik Anda — gratis selamanya.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {steps.map((step, i) => (
            <div key={step.title} className="relative text-center px-4">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Langkah {i + 1}
              </p>
              <h3 className="font-bold mb-1 dark:text-white">{step.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <div className="max-w-md mx-auto text-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all">
              Daftar & Klaim 1 Tag Gratis
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

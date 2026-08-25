'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ZapOff, Infinity as InfinityIcon, Lock } from 'lucide-react';
import { FloatingIcon } from '@/components/landing/floating-icon';

const licenseHighlights = [
  { icon: Lock, label: 'Proteksi Data Diri' },
  { icon: ZapOff, label: 'Bebas Baterai' },
  { icon: InfinityIcon, label: 'Berlaku Seumur Hidup' },
];

export function SmartLicenseHeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 text-center relative overflow-hidden dark:bg-slate-950">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <FloatingIcon icon={ShieldCheck} delay={0} className="absolute top-20 left-10 opacity-10 h-24 w-24 text-blue-600" />
        <FloatingIcon icon={Lock} delay={1} duration={5} className="absolute top-40 right-20 opacity-10 h-32 w-32 text-green-600" />
        <FloatingIcon icon={InfinityIcon} delay={2} duration={7} className="absolute bottom-20 left-1/4 opacity-10 h-28 w-28 text-purple-600" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
        >
          <ShieldCheck className="h-4 w-4" />
          Bukan Gantungan Kunci. Ini Sistem Proteksi Digital.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight dark:text-white"
        >
          Perkenalkan <span className="gradient-text">Balikin Smart License</span>
          <br className="hidden md:block" />{" "}
          Ketenangan Jiwa untuk Barang Berharga Anda
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto dark:text-gray-300"
        >
          Anda tidak sedang membeli akrilik atau stiker. Anda mengaktifkan{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">lisensi proteksi digital</span> — nomor HP Anda tidak tercetak di barang, tanpa baterai, dan berlaku seumur hidup.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-gray-500 mb-8 max-w-xl mx-auto dark:text-gray-400"
        >
          Gantungan akrilik, logam, atau stiker hanyalah <span className="font-semibold text-gray-700 dark:text-gray-300">media fisik</span> — wadah yang membawa teknologi digital ini ke mana pun barang Anda pergi.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <Link href="#konfigurator">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all"
            >
              Aktifkan Lisensi Mulai Rp35.000
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all" asChild>
            <Link href="#simulator-qr">Lihat Cara Kerjanya</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {licenseHighlights.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white shadow-sm border rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300"
            >
              <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

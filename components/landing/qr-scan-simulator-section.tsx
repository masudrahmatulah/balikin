'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { QrCode, MessageCircle, ShieldCheck, UserCircle2, Pause, Play } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    title: 'Penemu Scan QR Code',
    desc: 'Kamera HP penemu memindai QR di tag Anda — tanpa perlu install aplikasi apa pun.',
  },
  {
    icon: ShieldCheck,
    title: 'Halaman Info Tag Terbuka',
    desc: 'Penemu melihat halaman info barang Anda — nomor HP tidak tercetak di tag fisik.',
  },
  {
    icon: MessageCircle,
    title: 'Pesan Aman Terkirim',
    desc: 'Penemu klik tombol WhatsApp dan langsung terhubung ke Anda tanpa install aplikasi.',
  },
  {
    icon: UserCircle2,
    title: 'Anda Terhubung, Privasi Tetap Terjaga',
    desc: 'Anda balas seperti biasa. Barang kembali, dan nomor bisa Anda ganti kapan saja dari dashboard.',
  },
];

export function QrScanSimulatorSection() {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <section id="simulator-qr" className="bg-gray-50 dark:bg-slate-900 py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Simulasi: Saat Barang Anda Ditemukan</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Begini alur kerja sistem saat seseorang memindai QR code di barang Anda — cepat dan tanpa perlu aplikasi.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div
              className="relative aspect-square max-w-sm mx-auto w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 overflow-hidden"
              role="group"
              aria-roledescription="slide"
              aria-label={`Langkah ${active + 1} dari ${steps.length}`}
            >
              <button
                type="button"
                onClick={() => setAutoPlay((prev) => !prev)}
                className="absolute top-3 right-3 z-10 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 p-2 rounded-full transition-colors"
                aria-label={autoPlay ? 'Jeda animasi otomatis' : 'Lanjutkan animasi otomatis'}
              >
                {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                >
                  {(() => {
                    const Icon = steps[active].icon;
                    return <Icon className="h-20 w-20 text-blue-600 mb-6" aria-hidden="true" />;
                  })()}
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{steps[active].title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{steps[active].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              {steps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setAutoPlay(false);
                  }}
                  className={`w-full text-left flex items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                    active === i
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                  aria-pressed={active === i}
                >
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      active === i ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{step.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

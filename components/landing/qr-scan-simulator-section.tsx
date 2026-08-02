'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { QrCode, MessageCircle, ShieldCheck, UserCircle2 } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    title: 'Penemu Scan QR Code',
    desc: 'Kamera HP penemu memindai QR di tag Anda — tanpa perlu install aplikasi apa pun.',
  },
  {
    icon: ShieldCheck,
    title: 'Sistem Menyamarkan Nomor Anda',
    desc: 'Anonymous WhatsApp Gateway kami menyembunyikan nomor asli pemilik sepenuhnya.',
  },
  {
    icon: MessageCircle,
    title: 'Pesan Aman Terkirim',
    desc: 'Penemu mengirim pesan lewat tombol WhatsApp — chat langsung sampai ke Anda tanpa nomor terekspos.',
  },
  {
    icon: UserCircle2,
    title: 'Anda Terhubung, Privasi Tetap Terjaga',
    desc: 'Anda balas seperti biasa. Barang kembali, nomor pribadi Anda tetap 100% rahasia.',
  },
];

export function QrScanSimulatorSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="simulator-qr" className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simulasi: Saat Barang Anda Ditemukan</h2>
            <p className="text-gray-600">
              Begini alur kerja sistem saat seseorang memindai QR code di barang Anda — tanpa membocorkan nomor WhatsApp asli.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="relative aspect-square max-w-sm mx-auto w-full bg-white rounded-2xl shadow-xl border overflow-hidden">
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
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{steps[active].title}</h3>
                  <p className="text-sm text-gray-500">{steps[active].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              {steps.map((step, i) => (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`w-full text-left flex items-start gap-4 rounded-xl border-2 p-4 transition-all ${
                    active === i ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      active === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
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

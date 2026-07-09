'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { StatsBanner } from '@/components/landing/stat-counter';
import { UrgencyBadge } from '@/components/landing/urgency-badge';
import { FloatingIcon } from '@/components/landing/floating-icon';
import { GallerySlider } from '@/components/landing/gallery-slider';
import { Key, Shield as ShieldIcon, QrCode } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24 text-center relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <FloatingIcon icon={Key} delay={0} className="absolute top-20 left-10 opacity-10 h-24 w-24 text-blue-600" />
        <FloatingIcon icon={ShieldIcon} delay={1} duration={5} className="absolute top-40 right-20 opacity-10 h-32 w-32 text-green-600" />
        <FloatingIcon icon={QrCode} delay={2} duration={7} className="absolute bottom-20 left-1/4 opacity-10 h-28 w-28 text-purple-600" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
        >
          <Shield className="h-4 w-4" />
          Platform Smart Lost and Found Indonesia Terdepan
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
        >
          <span className="gradient-text">Balikin Smart Tag: QR Code Anti Hilang dengan Privasi 100% Terjaga</span>{' '}
          <br className="hidden md:block" />
          Gantungan Kunci QR Code Dinamis untuk{' '}
          <br className="hidden md:block" />
          <span className="text-red-500">Sistem Pelacakan Barang Hilang Modern</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto"
        >
          <span className="font-semibold text-gray-800">Platform Smart Lost and Found Indonesia</span> berbasis QR Code dinamis terkemuka.
          Sistem identifikasi barang dengan <span className="font-semibold text-gray-800">QR code WhatsApp 100% anonim</span> - penemu tidak bisa lihat nomor asli Anda.
          Lacak lokasi scan real-time, aktifkan Mode Hilang darurat dengan desain emergency.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-gray-500 mb-8 max-w-xl mx-auto"
        >
          Solusi terpadu <span className="font-semibold text-gray-700">gantungan kunci anti hilang</span> dengan teknologi
          <span className="font-semibold text-gray-700"> anonymous WhatsApp gateway</span> terdepan. Sistem pelacakan QR code yang memberikan privasi maksimal dan ketenangan pikiran untuk setiap barang berharga Anda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link href="/sign-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 transition-all animate-glow-pulse"
            >
              Dapatkan Proteksi Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          {/* Urgency Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-center mb-8"
          >
            <UrgencyBadge />
          </motion.div>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 border-2 hover:bg-gray-50 transition-all"
            asChild
          >
            <Link href="#cara-kerja">Pelajari Lebih Lanjut</Link>
          </Button>
        </motion.div>

        {/* Hero Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-12 max-w-4xl mx-auto w-full px-4"
        >
          <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16 / 9', backgroundColor: '#000' }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/K-lBpr5fQ-U?fs=1"
              title="putar"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                border: 'none',
              }}
            />
          </div>
        </motion.div>

        {/* Gallery Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12 max-w-4xl mx-auto w-full px-4"
        >
          <GallerySlider />
        </motion.div>

        {/* Hero Statistics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
        >
          <StatsBanner
            stats={[
              {
                value: 1000,
                suffix: '+',
                label: 'Tag Terdaftar',
              },
              {
                value: 100,
                suffix: '+',
                label: 'Barang Kembali',
                icon: <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />,
              },
              {
                value: 50,
                suffix: '+',
                label: 'Happy Users',
                icon: <Users className="h-6 w-6 text-purple-600" aria-hidden="true" />,
              },
              {
                value: 98,
                suffix: '%',
                label: 'Tingkat Kembalinya',
                icon: <TrendingUp className="h-6 w-6 text-orange-600" aria-hidden="true" />,
              },
            ]}
          />
        </motion.div>
      </div>
    </section>
  );
}
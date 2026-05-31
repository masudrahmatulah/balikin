'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { ArrowRight, Sparkles, QrCode, Scan, MessageCircle } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="bg-gradient-to-b from-white to-blue-50 py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Cara Kerja Simpel & Efektif
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hanya 3 Langkah untuk Perlindungan Maksimal
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Setup cepat, proteksi panjang. Dalam 2 menit, barang berharga Anda sudah punya "jaminan" untuk kembali.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                icon: QrCode,
                color: 'blue',
                title: 'Buat & Pasang QR Tag',
                desc: 'Daftar gratis, buat tag untuk barang Anda (kunci, tas, dompet), download QR code, dan tempel.',
                badge: '⏱️ 30 detik',
                delay: 0.1,
              },
              {
                step: 2,
                icon: Scan,
                color: 'green',
                title: 'Orang Lain Scan QR',
                desc: 'Jika barang hilang & ditemukan orang baik, mereka tinggal scan QR dengan kamera HP. Gampang!',
                badge: '📱 Tanpa aplikasi',
                delay: 0.3,
              },
              {
                step: 3,
                icon: MessageCircle,
                color: 'purple',
                title: 'Hubungi & Kembali!',
                desc: 'Penemu langsing bisa WhatsApp Anda tanpa lihat nomor asli. Koordinasi pengembalian lebih mudah!',
                badge: '🔒 Privasi terjaga',
                delay: 0.6,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay }}
                className="relative"
              >
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 bg-${item.color}-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10`}
                >
                  {item.step}
                </div>
                <Card className={`border-2 hover:border-${item.color}-300 hover-card-effect pt-8 text-center h-full`}>
                  <CardContent className="space-y-4">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: item.delay }}
                      className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-2xl mb-4 shadow-lg shadow-${item.color}-600/30`}
                      aria-hidden="true"
                    >
                      <item.icon className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                    <div className="pt-2">
                      <span
                        className={`text-xs font-medium text-${item.color}-600 bg-${item.color}-50 px-3 py-1 rounded-full`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Visual Flow Indicator */}
        <ScrollReveal delay={0.4}>
          <div className="flex justify-center items-center mt-8 gap-4">
            <div className="hidden md:flex items-center">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-green-600 rounded"></div>
            </div>
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden md:block"
              aria-hidden="true"
            >
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </motion.div>
            <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-purple-600 rounded hidden md:block"></div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
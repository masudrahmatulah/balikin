'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Lock, MapPin, Clock, AlertCircle } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: Lock,
      title: 'Privasi Terjaga',
      desc: 'Identitas Anda tidak ditampilkan di benda fisik, hanya QR code yang terlihat. Penemu tidak tahu data pribadi Anda.',
    },
    {
      icon: MapPin,
      title: 'Lacak Lokasi',
      desc: 'Riwayat scan menampilkan lokasi terakhir barang saat di-scan. Tau kemana barang Anda "terbang".',
    },
    {
      icon: Clock,
      title: 'Update Real-time',
      desc: 'Ubah data kontak atau status barang kapan saja tanpa perlu ganti QR code fisik. Fleksibel!',
    },
    {
      icon: AlertCircle,
      title: 'Mode Hilang',
      desc: 'Aktifkan mode hilang untuk tampilan darurat dengan info imbalan. Menarik simpati penemu.',
    },
  ];

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kenapa Memilih Balikin?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Lebih dari sekadar QR code. Ini adalah ketenangan pikiran untuk barang-barang Anda.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/15 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex justify-center mb-4"
                >
                  <benefit.icon className="h-10 w-10" aria-hidden="true" />
                </motion.div>
                <h3 className="font-bold mb-2 text-lg">{benefit.title}</h3>
                <p className="text-blue-100 text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
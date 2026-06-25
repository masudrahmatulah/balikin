'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Shield, Lock, CreditCard } from 'lucide-react';

const securityPillars = [
  {
    id: 'infrastructure',
    icon: Shield,
    title: 'Infrastruktur Global',
    subtitle: 'Powered by Vercel',
    description:
      'Website dan sistem scan QR kami di-host pada jaringan server Vercel global. Dijamin super cepat, stabil, dan dilengkapi perlindungan otomatis dari serangan siber (DDoS Protection).',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'privacy',
    icon: Lock,
    title: 'Privasi Data Terenkripsi',
    subtitle: 'Powered by Supabase',
    description:
      'Nomor WhatsApp dan alamat rumah Anda diisolasi menggunakan fitur Row Level Security (RLS) Supabase. Data Anda terenkripsi dan tidak akan bisa diintip oleh siapapun.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'payment',
    icon: CreditCard,
    title: 'Gerbang Pembayaran Resmi',
    subtitle: 'Powered by Midtrans',
    description:
      'Setiap transaksi lunas via QRIS diproses langsung oleh Midtrans. Berizin resmi dan diawasi oleh Bank Indonesia. Balikin tidak pernah menyimpan data keuangan Anda.',
    color: 'from-green-500 to-emerald-500',
  },
];

const trustLogos = [
  {
    name: 'Vercel',
    label: 'Global CDN & Infrastructure',
    bgColor: 'bg-black',
    textColor: 'text-white',
    emoji: '▲',
  },
  {
    name: 'Supabase',
    label: 'Database & Authentication',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    emoji: '🔐',
  },
  {
    name: 'Midtrans',
    label: 'Payment Gateway',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    emoji: '💳',
  },
  {
    name: 'Bank Indonesia',
    label: 'Regulatory Oversight',
    bgColor: 'bg-amber-600',
    textColor: 'text-white',
    emoji: '🏛️',
  },
];

export function TrustSecuritySection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
              🔐 Keamanan Data
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
          >
            Privasi Anda Adalah Prioritas Utama Kami
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Balikin dibangun dengan teknologi infrastruktur kelas dunia untuk memastikan data pribadi dan transaksi Anda terlindungi dengan enkripsi tingkat tinggi.
          </motion.p>
        </div>
      </ScrollReveal>

      {/* Security Pillars Grid */}
      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {securityPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <Card className="h-full border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-8">
                    {/* Icon Background Gradient */}
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-xl transition-all`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>

                    {/* Title & Subtitle */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{pillar.title}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-4">{pillar.subtitle}</p>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm">{pillar.description}</p>

                    {/* Accent Line */}
                    <motion.div
                      className={`h-1 w-0 bg-gradient-to-r ${pillar.color} mt-6 group-hover:w-full transition-all duration-500 rounded-full`}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Trust Badges / Tech Stack */}
      <ScrollReveal delay={0.5}>
        <div className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-8"
          >
            🏆 Infrastruktur Teknologi Terpercaya
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center"
          >
            {trustLogos.map((logo, idx) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Logo Container - Branded Background */}
                <div
                  className={`w-20 h-20 rounded-lg flex items-center justify-center mb-3 border-2 shadow-md transition-all group-hover:shadow-lg group-hover:scale-110 ${logo.bgColor}`}
                >
                  <span className={`text-3xl font-bold ${logo.textColor}`}>{logo.emoji}</span>
                </div>
                <p className="text-xs text-gray-600 text-center font-medium">{logo.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Regulatory Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-xs text-blue-700">
              <span className="font-bold">✓ Keamanan Terjamin:</span> Setiap aspek platform Balikin mematuhi standar keamanan internasional (ISO 27001) dan regulasi perlindungan data Indonesia.
            </p>
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  );
}

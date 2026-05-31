'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Home, User, MessageCircle, Heart } from 'lucide-react';

export function StoryTimelineSection() {
  const steps = [
    {
      icon: Home,
      title: 'Hari Biasa',
      desc: 'Anda pasang QR Balikin di kunci motor, tas anak, dan dompet. Merasa tenang karena barang berharga sudah "diasuransikan".',
      color: 'bg-blue-100',
      emoji: '😌',
    },
    {
      icon: <span className="h-8 w-8 text-red-600 flex items-center justify-center">⚠️</span>,
      title: 'Barang Hilang!',
      desc: 'Tanpa sengaja, kunci motor tertinggal di dashboard. Saat sadar, motor dan kunci sudah raib entah kemana. Panik!',
      color: 'bg-red-100',
      emoji: '😱',
    },
    {
      icon: User,
      title: 'Orang Baik Menemukan',
      desc: 'Seseorang menemukan kunci. Penasaran, dia scan QR code. Halaman muncul dengan tampilan darurat MERAH dan info kontak.',
      color: 'bg-orange-100',
      emoji: '🤔',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Masuk',
      desc: '"Halo, saya nemu kunci dengan QR Balikin. Ini punya Anda? Lokasi saya di..." Lega! Ada yang baiki menghubungi.',
      color: 'bg-green-100',
      emoji: '😊',
    },
    {
      icon: Heart,
      title: 'Barang Kembali!',
      desc: 'Ketemuan di lokasi, kunci kembali. Ucapkan terima kasih, mungkin traktir minum. Kisah bahagia berkat Balikin!',
      color: 'bg-pink-100',
      emoji: '🥰',
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cerita Balikin: Dari Panik ke Lega
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simak perjalanan seorang pemilik barang yang hampir putus asa...
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2" aria-hidden="true"></div>

            {/* Story steps */}
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-center mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} ml-20 md:ml-0`}>
                  <Card className={`${step.color} border-0`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3 md:justify-start">
                        <span className="text-2xl" aria-hidden="true">{step.emoji}</span>
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      </div>
                      <p className="text-gray-700 text-sm">{step.desc}</p>
                    </CardContent>
                  </Card>
                </div>
                <div
                  className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-5 h-5 bg-white border-4 border-blue-600 rounded-full z-10"
                  aria-hidden="true"
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Key, AlertCircle, Heart } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export function PainPointsSection() {
  return (
    <section className="bg-gradient-to-r from-red-50 to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Pernah Ngalamin Ini?
            </h2>
            <p className="text-gray-600">
              Situasi yang pasti bikin deg-degan dan nggak enak banget...
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Key className="h-8 w-8 text-red-600" aria-hidden="true" />,
                title: 'Kunci Raib Entah Kemana',
                desc: 'Pernah hilang kunci dan nggak tau baliknya kemana? Cari ke sana kemari nggak ketemu?',
              },
              {
                icon: <AlertCircle className="h-8 w-8 text-orange-600" aria-hidden="true" />,
                title: 'Takut Tulis Data di Kunci',
                desc: 'Ingin tulis nama & HP di kunci tapi takut disalahgunakan orang yang nggak bertanggung jawab?',
              },
              {
                icon: <Heart className="h-8 w-8 text-red-600" aria-hidden="true" />,
                title: 'Nemu Barang Tapi Bingung',
                desc: 'Pernah nemu HP/dompet tapi bingung gimana cara balikinnya ke pemilik asli?',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">{item.title}</h3>
                <p className="text-sm text-gray-600 text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
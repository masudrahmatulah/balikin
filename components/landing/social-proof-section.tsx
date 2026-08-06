'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Badge } from '@/components/landing/badge';
import { Shield, Gift, Smartphone, Zap, ShieldCheck } from 'lucide-react';
import { TestimonialCard, testimonials } from '@/components/landing/testimonial-card';

export function SocialProofSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Dipercaya oleh Ratusan Pengguna Indonesia
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Mereka sudah merasakan ketenangan memiliki proteksi Balikin untuk barang-barang berharga mereka.
          </p>
        </div>
      </ScrollReveal>

      {/* Trust Badges */}
      <ScrollReveal delay={0.2}>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Badge icon={Shield} text="Privasi Terjamin" colorClass="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" delay={0} />
          <Badge icon={Gift} text="Gratis Selamanya" colorClass="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" delay={0.1} />
          <Badge icon={Smartphone} text="Tanpa Aplikasi" colorClass="bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" delay={0.2} />
          <Badge icon={Zap} text="Setup 2 Menit" colorClass="bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400" delay={0.3} />
        </div>
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <p className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
          Upgrade ke lisensi premium untuk mendapatkan{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">⭐ Verified Owner Badge</span> di halaman publik Anda.
        </p>
      </ScrollReveal>
    </section>
  );
}
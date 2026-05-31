'use client';

import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Badge } from '@/components/landing/badge';
import { Shield, Gift, Smartphone, Zap } from 'lucide-react';
import { TestimonialCard, testimonials } from '@/components/landing/testimonial-card';

export function SocialProofSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dipercaya oleh Ratusan Pengguna Indonesia
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mereka sudah merasakan ketenangan memiliki proteksi Balikin untuk barang-barang berharga mereka.
          </p>
        </div>
      </ScrollReveal>

      {/* Trust Badges */}
      <ScrollReveal delay={0.2}>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Badge icon={Shield} text="Privasi Terjamin" colorClass="bg-green-100 text-green-700" delay={0} />
          <Badge icon={Gift} text="Gratis Selamanya" colorClass="bg-blue-100 text-blue-700" delay={0.1} />
          <Badge icon={Smartphone} text="Tanpa Aplikasi" colorClass="bg-purple-100 text-purple-700" delay={0.2} />
          <Badge icon={Zap} text="Setup 2 Menit" colorClass="bg-orange-100 text-orange-700" delay={0.3} />
        </div>
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal delay={0.3}>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
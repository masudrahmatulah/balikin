'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Check, MessageCircle } from 'lucide-react';
import { SimpleUrgencyBadge } from '@/components/landing/urgency-badge';

export function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proteksi Gratis, Upgrade Premium
          </h2>
          <p className="text-gray-600 mb-12 max-w-xl mx-auto">
            Mulai gratis sekarang, upgrade kapan saja butuh produk fisik premium.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 h-full">
                <CardHeader className="text-center pb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Mulai Sekarang</div>
                  <div className="text-4xl font-bold">Rp 0</div>
                  <div className="text-gray-500">selamanya, tanpa kartu kredit</div>
                </CardHeader>
                <CardContent className="text-left">
                  <ul className="space-y-3">
                    {[
                      'Maksimal 2 Tag Digital',
                      'QR code generator high-quality',
                      'Scan logging dengan lokasi',
                      'Alert scan via email',
                      'Mode Hilang dengan info imbalan',
                      'Update data real-time',
                      'Dashboard user-friendly',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="block mt-6">
                    <Button className="w-full" variant="outline" size="lg">
                      Mulai Gratis Sekarang
                    </Button>
                  </Link>
                  <div className="mt-4 flex justify-center">
                    <SimpleUrgencyBadge spots={999} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 h-full relative shadow-xl shadow-blue-600/10">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                    PREMIUM
                  </span>
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="text-sm font-medium text-blue-600 mb-2">Premium</div>
                  <div className="text-4xl font-bold gradient-text">Rp 35.000</div>
                  <div className="text-gray-500">per tag, satu kali bayar</div>
                </CardHeader>
                <CardContent className="text-left">
                  <ul className="space-y-3">
                    {[
                      'Semua fitur Gratis',
                      'Gantungan kunci fisik premium (akrilik/vinyl)',
                      'Verified Owner Badge khusus',
                      'Unlimited Tags',
                      'Notifikasi WhatsApp instan',
                      'Email alert opsional',
                      'Priority support',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/upgrade" className="block mt-6">
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                      Pesan Sekarang
                    </Button>
                  </Link>
                  <div className="mt-4 flex justify-center">
                    <SimpleUrgencyBadge spots={47} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { ArrowRight, AlertCircle, MessageCircle } from 'lucide-react';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';
import { TestimonialCard, testimonials } from '@/components/landing/testimonial-card';

export function FinalCTASection() {
  return (
    <>
      {/* Final CTA - Urgency & Scarcity */}
      <section className="container mx-auto px-4 py-20 text-center">
        <ScrollReveal>
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white border-0 shadow-2xl shadow-blue-600/30 overflow-hidden relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full"
                />
              </div>

              <CardContent className="pt-12 pb-12 px-8 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block mb-6"
                >
                  <AlertCircle className="h-16 w-16 text-yellow-300 mx-auto" aria-hidden="true" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Jangan Tunggu Sampai Barang Hilang!
                </h2>
                <p className="text-blue-100 mb-4 text-lg">
                  Kehilangan itu tiba-tiba. Tapi proteksi bisa Anda persiapkan sekarang.
                </p>
                <p className="text-blue-200 mb-8 max-w-xl mx-auto">
                  Dalam 2 menit, Anda bisa memberikan "asuransi" untuk kunci motor, tas anak, dompet, dan semua barang berharga Anda.
                  <strong className="text-white"> Gratis selamanya, tanpa biaya tersembunyi.</strong>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="text-lg px-8 py-6 bg-white text-blue-700 hover:bg-gray-100 shadow-xl"
                    >
                      Proteksi Barang Sekarang
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-blue-200">
                  Join 1,000+ user yang sudah merasa tenang dengan Balikin
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </ScrollReveal>
      </section>

      {/* Order CTA - WhatsApp */}
      <section className="container mx-auto px-4 pb-16">
        <ScrollReveal>
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover-card-effect">
            <CardContent className="pt-8 pb-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
              >
                <MessageCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Ingin QR Tag Fisik Premium?</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Dapatkan gantungan kunci dengan QR code berkualitas tinggi yang tahan air, anti-gores, dan desain kekinian.
                Hubungi kami via WhatsApp untuk pemesanan.
              </p>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30"
                onClick={() => window.open(`https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=Halo%2C%20saya%20tertarik%20untuk%20pesan%20QR%20Tag%20fisik%20Balikin`, '_blank')}
              >
                <MessageCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                Pesan via WhatsApp
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Bisa custom nama/logo untuk hadiah atau corporate
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* More Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Kisah Nyata dari Mereka yang sudah "Merasakan"
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.slice(3).map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} index={index} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
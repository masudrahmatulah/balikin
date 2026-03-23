'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Shield,
  Smartphone,
  MapPin,
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Gift,
  Clock,
  Lock,
  X,
  Key,
  Home,
  User,
  AlertCircle,
  Heart,
  Zap,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  Scan,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TestimonialCard, testimonials } from '@/components/landing/testimonial-card';
import { StatsBanner } from '@/components/landing/stat-counter';
import { ScenarioCard, scenarios } from '@/components/landing/scenario-card';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { BundleDeals } from '@/components/landing/bundle-deals';
import { UrgencyBadge, SimpleUrgencyBadge, FlashSaleBanner } from '@/components/landing/urgency-badge';
import { faqItems } from '@/lib/site-content';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';
import { SiteHeader } from '@/components/site-header';

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-b"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 px-2 rounded transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4 px-2 text-gray-600"
        >
          {answer}
        </motion.div>
      )}
    </motion.div>
  );
}

function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Pertanyaan yang Sering Diajukan
        </motion.h2>
        <Card>
          <CardContent className="p-0">
            {faqItems.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ScrollReveal component
function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Flash Sale Banner - Urgency */}
      <FlashSaleBanner />

      {/* Header - Auth-Aware Navigation */}
      <SiteHeader />

      {/* Hero Section - Problem-Agitasi-Solution Framework */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 opacity-10"
          >
            <Key className="h-24 w-24 text-blue-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-40 right-20 opacity-10"
          >
            <Shield className="h-32 w-32 text-green-600" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 20, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-20 left-1/4 opacity-10"
          >
            <QrCode className="h-28 w-28 text-purple-600" />
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Shield className="h-4 w-4" />
            Smart Lost & Found Platform Indonesia
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            <span className="gradient-text">Kunci Hilang?</span>{' '}
            <br className="hidden md:block" />
            Dompet Ketemu Tapi Bingung{' '}
            <br className="hidden md:block" />
            <span className="text-red-500">Hubungi Pemiliknya?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto"
          >
            Pernah nemu barang tapi bingung gimana cara balikinnya?{' '}
            <span className="font-semibold text-gray-800">Atau pernah hilang barang dan berharap ada yang baik mengembalikannya?</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-gray-500 mb-8 max-w-xl mx-auto"
          >
            Balikin hadir sebagai jembatan kebaikan. QR code dinamis yang menghubungkan barang hilang dengan pemiliknya—tanpa kompromi privasi.
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
                Mulai Sekarang, Gratis Selamanya
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

          {/* Hero Statistics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
          >
            <StatsBanner
              stats={[
                {
                  value: 1000,
                  suffix: '+',
                  label: 'Tag Terdaftar',
                  icon: <QrCode className="h-6 w-6 text-blue-600" />,
                },
                {
                  value: 100,
                  suffix: '+',
                  label: 'Barang Kembali',
                  icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
                },
                {
                  value: 50,
                  suffix: '+',
                  label: 'Happy Users',
                  icon: <Users className="h-6 w-6 text-purple-600" />,
                },
                {
                  value: 98,
                  suffix: '%',
                  label: 'Tingkat Kembalinya',
                  icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
                },
              ]}
            />
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section */}
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
                  icon: <Key className="h-8 w-8 text-red-600" />,
                  title: 'Kunci Raib Entah Kemana',
                  desc: 'Pernah hilang kunci dan nggak tau baliknya kemana? Cari ke sana kemari nggak ketemu?',
                },
                {
                  icon: <AlertCircle className="h-8 w-8 text-orange-600" />,
                  title: 'Takut Tulis Data di Kunci',
                  desc: 'Ingin tulis nama & HP di kunci tapi takut disalahgunakan orang yang nggak bertanggung jawab?',
                },
                {
                  icon: <Heart className="h-8 w-8 text-red-600" />,
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

      {/* Social Proof Section - Trust Badges & Testimonials */}
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
            {[
              { icon: <Shield className="h-5 w-5" />, text: 'Privasi Terjamin', color: 'bg-green-100 text-green-700' },
              { icon: <Gift className="h-5 w-5" />, text: 'Gratis Selamanya', color: 'bg-blue-100 text-blue-700' },
              { icon: <Smartphone className="h-5 w-5" />, text: 'Tanpa Aplikasi', color: 'bg-purple-100 text-purple-700' },
              { icon: <Zap className="h-5 w-5" />, text: 'Setup 2 Menit', color: 'bg-orange-100 text-orange-700' },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge.color} font-medium`}
              >
                {badge.icon}
                {badge.text}
              </motion.div>
            ))}
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

      {/* Cara Kerja Section - Enhanced */}
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
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  1
                </div>
                <Card className="border-2 hover:border-blue-300 hover-card-effect pt-8 text-center h-full">
                  <CardContent className="space-y-4">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/30"
                    >
                      <QrCode className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">Buat & Pasang QR Tag</h3>
                    <p className="text-gray-600">
                      Daftar gratis, buat tag untuk barang Anda (kunci, tas, dompet), download QR code, dan tempel.
                    </p>
                    <div className="pt-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        ⏱️ 30 detik
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  2
                </div>
                <Card className="border-2 hover:border-green-300 hover-card-effect pt-8 text-center h-full">
                  <CardContent className="space-y-4">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg shadow-green-600/30"
                    >
                      <Scan className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">Orang Lain Scan QR</h3>
                    <p className="text-gray-600">
                      Jika barang hilang & ditemukan orang baik, mereka tinggal scan QR dengan kamera HP. Gampang!
                    </p>
                    <div className="pt-2">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        📱 Tanpa aplikasi
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10">
                  3
                </div>
                <Card className="border-2 hover:border-purple-300 hover-card-effect pt-8 text-center h-full">
                  <CardContent className="space-y-4">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-600/30"
                    >
                      <MessageCircle className="h-12 w-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900">Hubungi & Kembali!</h3>
                    <p className="text-gray-600">
                      Penemu langsing bisa WhatsApp Anda tanpa lihat nomor asli. Koordinasi pengembalian lebih mudah!
                    </p>
                    <div className="pt-2">
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        🔒 Privasi terjaga
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
              >
                <ArrowRight className="h-6 w-6 text-gray-400" />
              </motion.div>
              <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-purple-600 rounded hidden md:block"></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Use Cases / Scenarios Section */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cocok Buat Siapa Saja!
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Apapun gaya hidupmu, Balikin punya solusi untuk proteksi barang berharga.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenarios.map((scenario, index) => (
              <ScenarioCard key={index} scenario={scenario} index={index} />
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Product Showcase Section */}
      <ProductShowcase />

      {/* Comparison Section - Balikin vs Traditional */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Balikin vs Cara Tradisional
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kenapa ribuan orang beralih ke Balikin untuk proteksi barang mereka?
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Traditional */}
                <Card className="border-2 border-gray-200 opacity-75">
                  <CardHeader className="text-center pb-4 border-b">
                    <div className="flex justify-center mb-2">
                      <X className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700">Cara Tradisional</h3>
                    <p className="text-sm text-gray-500">Stiker nama di kunci/tas</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {[
                        { text: 'Privasi terpapar (nama & HP terlihat)', bad: true },
                        { text: 'Ganti nomor = harus ganti stiker', bad: true },
                        { text: 'Tidak bisa update status hilang', bad: true },
                        { text: 'Penemu harus simpan nomor dulu', bad: true },
                        { text: 'Tidak ada tracking lokasi', bad: true },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {item.bad ? (
                            <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-gray-600">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Balikin */}
                <Card className="border-2 border-blue-600 shadow-xl shadow-blue-600/20 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                      LEBIH BAIK
                    </span>
                  </div>
                  <CardHeader className="text-center pb-4 border-b bg-blue-50/50">
                    <div className="flex justify-center mb-2">
                      <Award className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-600">Balikin</h3>
                    <p className="text-sm text-gray-500">QR code dinamis smart</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {[
                        { text: 'Privasi terjaga (hanya QR yang terlihat)', bad: false },
                        { text: 'Ganti nomor = update di dashboard saja', bad: false },
                        { text: 'Mode Hilang dengan alert darurat', bad: false },
                        { text: 'Penemu langsung WhatsApp (tanpa simpan nomor)', bad: false },
                        { text: 'Tracking lokasi setiap scan', bad: false },
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {item.bad ? (
                            <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-gray-700 font-medium">{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Before/After Story Section - Storytelling */}
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
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2"></div>

              {/* Story steps */}
              {[
                {
                  icon: <Home className="h-8 w-8 text-blue-600" />,
                  title: 'Hari Biasa',
                  desc: 'Anda pasang QR Balikin di kunci motor, tas anak, dan dompet. Merasa tenang karena barang berharga sudah "diasuransikan".',
                  color: 'bg-blue-100',
                  emoji: '😌',
                },
                {
                  icon: <AlertCircle className="h-8 w-8 text-red-600" />,
                  title: 'Barang Hilang!',
                  desc: 'Tanpa sengaja, kunci motor tertinggal di dashboard. Saat sadar, motor dan kunci sudah raib entah kemana. Panik!',
                  color: 'bg-red-100',
                  emoji: '😱',
                },
                {
                  icon: <User className="h-8 w-8 text-orange-600" />,
                  title: 'Orang Baik Menemukan',
                  desc: 'Seseorang menemukan kunci. Penasaran, dia scan QR code. Halaman muncul dengan tampilan darurat MERAH dan info kontak.',
                  color: 'bg-orange-100',
                  emoji: '🤔',
                },
                {
                  icon: <MessageCircle className="h-8 w-8 text-green-600" />,
                  title: 'WhatsApp Masuk',
                  desc: '"Halo, saya nemu kunci dengan QR Balikin. Ini punya Anda? Lokasi saya di..." Lega! Ada yang baiki menghubungi.',
                  color: 'bg-green-100',
                  emoji: '😊',
                },
                {
                  icon: <Heart className="h-8 w-8 text-pink-600" />,
                  title: 'Barang Kembali!',
                  desc: 'Ketemuan di lokasi, kunci kembali. Ucapkan terima kasih, mungkin traktir minum. Kisah bahagia berkat Balikin!',
                  color: 'bg-pink-100',
                  emoji: '🥰',
                },
              ].map((step, i) => (
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
                          <span className="text-2xl">{step.emoji}</span>
                          <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-700 text-sm">{step.desc}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-5 h-5 bg-white border-4 border-blue-600 rounded-full z-10"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
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
              {[
                {
                  icon: <Lock className="h-10 w-10" />,
                  title: 'Privasi Terjaga',
                  desc: 'Identitas Anda tidak ditampilkan di benda fisik, hanya QR code yang terlihat. Penemu tidak tahu data pribadi Anda.',
                },
                {
                  icon: <MapPin className="h-10 w-10" />,
                  title: 'Lacak Lokasi',
                  desc: 'Riwayat scan menampilkan lokasi terakhir barang saat di-scan. Tau kemana barang Anda "terbang".',
                },
                {
                  icon: <Clock className="h-10 w-10" />,
                  title: 'Update Real-time',
                  desc: 'Ubah data kontak atau status barang kapan saja tanpa perlu ganti QR code fisik. Fleksibel!',
                },
                {
                  icon: <AlertCircle className="h-10 w-10" />,
                  title: 'Mode Hilang',
                  desc: 'Aktifkan mode hilang untuk tampilan darurat dengan info imbalan. Menarik simpati penemu.',
                },
              ].map((benefit, i) => (
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
                    {benefit.icon}
                  </motion.div>
                  <h3 className="font-bold mb-2 text-lg">{benefit.title}</h3>
                  <p className="text-blue-100 text-sm">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bundle Deals Section */}
      <BundleDeals />

      {/* Pricing Section - Enhanced */}
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
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
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
                          <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/upgrade" className="block mt-6">
                      <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        <MessageCircle className="mr-2 h-4 w-4" />
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

      {/* FAQ Section */}
      <FAQSection />

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
              <div className="absolute inset-0 pointer-events-none">
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
                  <AlertCircle className="h-16 w-16 text-yellow-300 mx-auto" />
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
                      <ArrowRight className="ml-2 h-5 w-5" />
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
                <MessageCircle className="h-10 w-10 text-green-600" />
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
                <MessageCircle className="mr-2 h-5 w-5" />
                Pesan via WhatsApp
              </Button>
              <p className="text-sm text-gray-500 mt-4">
                Bisa custom nama/logo untuk hadiah atau corporate
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Balikin</span>
              </div>
              <p className="text-gray-600 text-sm">
                Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital. Karena kebaikan harus dimudahkan.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/how-it-works" className="hover:text-blue-600">Cara Kerja</Link></li>
                <li><Link href="/sign-up" className="hover:text-blue-600">Daftar Gratis</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600">Harga</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/contact" className="hover:text-blue-600">Kontak</Link></li>
                <li><Link href="/about" className="hover:text-blue-600">Tentang Kami</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-blue-600">Kebijakan Privasi</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Balikin. Smart Lost & Found Platform Indonesia.</p>
            <p className="mt-2">Dibuat dengan ❤️ di Indonesia</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

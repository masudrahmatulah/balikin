'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Check, ShoppingCart } from 'lucide-react';
import { SimpleUrgencyBadge } from '@/components/landing/urgency-badge';

const productGroups = [
  {
    id: 'free',
    title: 'Gratis',
    price: 'Rp 0',
    subtitle: 'selamanya, tanpa kartu kredit',
    badge: null,
    features: [
      '🔒 Anonymous WhatsApp Gateway (Privacy 100%)',
      '📍 Live Scan Location Tracking',
      '🚨 Lost Mode dengan Reward System',
      '📧 Notifikasi scan via email real-time',
      '🏷️ QR Code high-quality untuk cetak sendiri',
      '📊 Dashboard management yang user-friendly',
      '♾️ Scan history unlimited (selamanya)',
      '🆓 Gratis selamanya tanpa kartu kredit',
    ],
    cta: { text: 'Mulai Gratis Sekarang', href: '/sign-up', variant: 'outline', spots: 999 },
    gradient: false,
  },
  {
    id: 'acrylic-keychain',
    title: 'Gantungan Akrilik QR Code Tag',
    price: 'Rp 54.000+',
    subtitle: 'satu kali bayar',
    badge: 'GANTUNGAN',
    features: [
      'Semua fitur Gratis + Hardware Fisik',
      '🔑 Balikin Armor Tag - Premium Acrylic (Rp 54k)',
      '⭐ Durable & Weather-resistant',
      '🎨 Desain premium eksklusif',
      '📱 QR Code terintegrasi sempurna',
      '🆓 Bonus: WhatsApp Gateway gratis 1 tahun',
      '✨ Verified Owner Badge khusus',
      '🎁 Garansi kepuasan 100%',
    ],
    cta: { text: 'Pesan Sekarang', href: '/stickers/checkout', variant: 'default', spots: 72 },
    gradient: false,
  },
  {
    id: 'sticker-tags',
    title: 'Sticker QR Code Tag',
    price: 'Rp 59.000+',
    subtitle: 'satu kali bayar',
    badge: 'STIKER',
    comingSoon: true,
    features: [
      'Semua fitur Gratis + Hardware Fisik',
      '🏷️ Stiker Balikin Pro - Premium Quality (Rp 59k)',
      '📦 Stiker Balikin Daily - Praktis & Tahan (Rp 49k)',
      '🎯 Stiker Balikin Micro - Ultra Compact (Rp 39k)',
      '👨‍👩‍👧 Stiker Balikin Family - 4 Design Pack (Rp 149k)',
      '🆓 Bonus: WhatsApp Gateway gratis 1 tahun',
      '✨ Verified Owner Badge khusus',
      '🎁 Garansi kepuasan 100%',
    ],
    cta: { text: 'Pesan Sekarang', href: '/stickers/checkout', variant: 'default', spots: 156 },
    gradient: false,
  },
  {
    id: 'packages',
    title: 'Paket Bundle Lengkap',
    price: 'Rp 299.000+',
    subtitle: 'satu kali bayar',
    badge: 'PAKET',
    comingSoon: true,
    features: [
      'Semua fitur Gratis + Hardware Bundle Lengkap',
      '👨‍👩‍👧‍👦 Paket Keluarga - 4 Sets Protection (Rp 299k)',
      '🌍 Paket Traveller - 10 Sets Bundle (Rp 699k)',
      '📦 Mix & Match: Gantungan + Stiker',
      '🎯 Hemat hingga 40% vs beli satuan',
      '🆓 Bonus: WhatsApp Gateway gratis 1 tahun',
      '✨ Verified Owner Badge khusus',
      '🎁 Garansi kepuasan 100%',
    ],
    cta: { text: 'Pesan Sekarang', href: '/stickers/checkout', variant: 'default', spots: 28 },
    gradient: true,
  },
];

export function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Paket Proteksi untuk Setiap Kebutuhan & Budget
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan Anda. Mulai dari digital gratis atau upgrade ke hardware premium dengan berbagai pilihan gantungan, stiker, dan paket bundle lengkap.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="w-full">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productGroups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-2 h-full flex flex-col relative ${group.gradient ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl shadow-blue-600/10' : ''} ${group.comingSoon ? 'opacity-75' : ''}`}>
                  {group.comingSoon && (
                    <div className="absolute inset-0 bg-black/5 rounded-lg z-20 flex items-center justify-center">
                      <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                        <span className="text-sm font-bold text-gray-800">Coming Soon</span>
                      </div>
                    </div>
                  )}
                  {group.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
                        group.gradient
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-gray-600'
                      }`}>
                        {group.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader className={`text-center pb-4 ${group.gradient ? 'relative' : ''}`}>
                    <div className={`text-sm font-medium mb-2 ${group.gradient ? 'text-blue-600' : 'text-gray-500'}`}>
                      {group.title}
                    </div>
                    <div className={`text-3xl font-bold ${group.gradient ? 'gradient-text' : ''}`}>
                      {group.price}
                    </div>
                    <div className="text-gray-500 text-sm">{group.subtitle}</div>
                  </CardHeader>
                  <CardContent className="text-left flex-grow flex flex-col">
                    <ul className="space-y-2 flex-grow">
                      {group.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${group.gradient ? 'text-blue-600' : 'text-green-600'}`} aria-hidden="true" />
                          <span className={feature.startsWith('Rp') || feature.includes('Rp') ? 'text-xs text-gray-600' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-col gap-3">
                      {group.comingSoon ? (
                        <Button disabled className="w-full" size="sm">
                          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
                          Coming Soon
                        </Button>
                      ) : (
                        <Link href={group.cta.href} className="block">
                          <Button
                            className={`w-full ${group.gradient ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            variant={group.cta.variant === 'outline' ? 'outline' : 'default'}
                            size="sm"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
                            {group.cta.text}
                          </Button>
                        </Link>
                      )}
                      {!group.comingSoon && (
                        <div className="flex justify-center">
                          <SimpleUrgencyBadge spots={group.cta.spots} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Check, X, Zap, Gift } from 'lucide-react';

export function FreeVsPremiumComparison() {
  const features = [
    {
      category: 'Core Features',
      items: [
        { feature: 'QR Code Generator', free: true, premium: true },
        { feature: 'Anonymous WhatsApp Gateway', free: true, premium: true },
        { feature: 'Dashboard Management', free: true, premium: true },
        { feature: 'Scan History', free: true, premium: true },
        { feature: 'Location Tracking', free: true, premium: true },
      ],
    },
    {
      category: 'Hardware & Physical Products',
      items: [
        { feature: 'Physical Acrylic Keychain', free: false, premium: true },
        { feature: 'Premium Vinyl Stickers', free: false, premium: true },
        { feature: 'Custom Photo Printing', free: false, premium: true },
        { feature: 'Waterproof Design', free: false, premium: true },
        { feature: 'Bundle Packages', free: false, premium: true },
      ],
    },
    {
      category: 'Verification & Badges',
      items: [
        { feature: 'Verified Owner Badge', free: false, premium: true },
        { feature: 'Priority Support', free: false, premium: true },
        { feature: 'Extended WhatsApp Gateway', free: 'Limited', premium: true, customLabel: { free: '3 bulan', premium: '1 tahun' } },
      ],
    },
    {
      category: 'Durability',
      items: [
        { feature: 'QR Code Protection', free: 'Paper/DIY', premium: 'Professional Grade' },
        { feature: 'Weather Resistance', free: false, premium: true },
        { feature: 'Lifespan', free: '3-6 bulan', premium: '2+ tahun' },
      ],
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Gratis Digital vs Premium Fisik
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih paket yang sesuai kebutuhan Anda. Mulai gratis atau upgrade ke produk fisik berkualitas premium.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-6xl mx-auto">
            {/* Sticky Header untuk Desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-8">
              <div />
              <div className="text-center">
                <div className="bg-blue-50 border-2 border-gray-200 rounded-lg p-6">
                  <div className="text-sm font-medium text-gray-500 mb-1">Paket Gratis</div>
                  <div className="text-2xl font-bold text-gray-900">Rp 0</div>
                  <div className="text-xs text-gray-500 mt-1">Selamanya, tanpa kartu kredit</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-600 rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="text-sm font-medium text-blue-600 mb-1">Paket Premium</div>
                  <div className="text-2xl font-bold text-gray-900">Rp 54k+</div>
                  <div className="text-xs text-gray-600 mt-1">Gantungan atau Stiker berkualitas</div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-6">
              {features.map((category, catIdx) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIdx * 0.1 }}
                >
                  <div className="bg-gray-100 px-4 py-2 rounded-t-lg font-semibold text-gray-900 text-sm md:text-base">
                    {category.category}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Feature Names */}
                    <div className="space-y-4">
                      {category.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-gray-200 px-4 py-3 rounded-lg md:rounded-none md:border-none min-h-16 flex items-center text-sm md:text-base font-medium text-gray-700"
                        >
                          {item.feature}
                        </div>
                      ))}
                    </div>

                    {/* Free Column */}
                    <div className="space-y-4">
                      {category.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 border border-gray-200 px-4 py-3 rounded-lg md:rounded-none md:border-b md:border-gray-200 md:bg-white min-h-16 flex items-center justify-center md:justify-start"
                        >
                          {typeof item.free === 'boolean' ? (
                            item.free ? (
                              <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                            ) : (
                              <X className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            )
                          ) : (
                            <span className="text-sm text-gray-600">{item.free}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Premium Column */}
                    <div className="space-y-4">
                      {category.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-purple-50 border-2 border-blue-600 px-4 py-3 rounded-lg md:rounded-none md:border-b-2 md:border-blue-600 md:bg-blue-50 min-h-16 flex items-center justify-center md:justify-start"
                        >
                          {typeof item.premium === 'boolean' ? (
                            item.premium ? (
                              <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                <span className="hidden md:inline text-sm font-medium text-blue-600">Included</span>
                              </div>
                            ) : (
                              <X className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-blue-600">{item.premium}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Call-to-Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white"
            >
              <Gift className="h-8 w-8 mx-auto mb-3 opacity-90" aria-hidden="true" />
              <h3 className="text-2xl font-bold mb-2">Mulai Gratis Hari Ini</h3>
              <p className="mb-6 text-blue-100">
                Tidak perlu kartu kredit. Upgrade ke Premium kapan saja sesuai kebutuhan Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/sign-up"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Coba Gratis
                </a>
                <a
                  href="/stickers/checkout"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Lihat Paket Premium
                </a>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

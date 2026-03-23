'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BadgePercent, Users, Plane, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Bundle {
  name: string;
  items: string;
  originalPrice: number;
  promoPrice: number;
  discount: string;
  popular: boolean;
  icon: React.ElementType;
  features: string[];
  validUntil?: string;
}

interface BundleDealsProps {
  className?: string;
}

export function BundleDeals({ className = '' }: BundleDealsProps) {
  const bundles: Bundle[] = [
    {
      name: 'Paket Keluarga',
      items: '3 Gantungan Kunci + 2 Stiker QR',
      originalPrice: 125000,
      promoPrice: 85000,
      discount: 'Hemat Rp 40.000',
      popular: true,
      icon: Users,
      features: [
        '3 Gantungan akrilik premium custom',
        '2 Stiker vinyl waterproof',
        'Free design & layout',
        'Garansi kualitas',
        'Support prioritas',
      ],
      validUntil: 'Terbatas 50 paket pertama',
    },
    {
      name: 'Paket Traveler',
      items: '2 Stiker QR + 1 Gantungan Kunci',
      originalPrice: 65000,
      promoPrice: 50000,
      discount: 'Hemat Rp 15.000',
      popular: false,
      icon: Plane,
      features: [
        '1 Gantungan akrilik premium',
        '2 Stiker vinyl waterproof',
        'Ideal untuk koper & helm',
        'Tahan cuaca ekstrem',
        'Full dashboard access',
      ],
      validUntil: 'Terbatas 100 paket pertama',
    },
  ];

  const formatPrice = (price: number) => {
    return 'Rp ' + price.toLocaleString('id-ID');
  };

  return (
    <section className={`bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BadgePercent className="h-4 w-4" />
            Promo Spesial
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Hemat Lebih Banyak dengan Bundle Deals!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dapatkan perlindungan lengkap untuk seluruh keluarga dengan harga spesial. Terbatas!
          </p>
        </motion.div>

        {/* Urgency Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 text-center shadow-xl shadow-orange-500/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔥
              </motion.div>
              <span className="font-bold text-lg">Flash Sale Hari Ini!</span>
            </div>
            <p className="text-orange-100">
              Diskon tambahan 10% untuk 10 pembeli pertama dengan kode: <span className="font-bold text-white bg-white/20 px-2 py-1 rounded">BALIKIN10</span>
            </p>
          </div>
        </motion.div>

        {/* Bundles Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {bundles.map((bundle, index) => {
            const Icon = bundle.icon;
            const savingsPercent = Math.round(
              ((bundle.originalPrice - bundle.promoPrice) / bundle.originalPrice) * 100
            );

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {bundle.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <BadgePercent className="h-4 w-4" />
                      Paling Laris
                    </span>
                  </div>
                )}

                <Card
                  className={`h-full hover-card-effect border-2 ${
                    bundle.popular
                      ? 'border-orange-300 shadow-xl shadow-orange-500/10 bg-gradient-to-br from-orange-50/50 to-white'
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/30">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {bundle.name}
                    </h3>

                    {/* Items */}
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {bundle.items}
                    </p>

                    {/* Price Section */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(bundle.originalPrice)}
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                          -{savingsPercent}%
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(bundle.promoPrice)}
                        </span>
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-sm font-medium text-green-600">
                          {bundle.discount}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                      {bundle.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Validity */}
                    {bundle.validUntil && (
                      <div className="mb-4 text-center">
                        <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                          ⏰ {bundle.validUntil}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      className={`w-full ${
                        bundle.popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                      onClick={() =>
                        window.open(
                          `https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20pesan%20${encodeURIComponent(
                            bundle.name
                          )}`,
                          '_blank'
                        )
                      }
                    >
                      Ambil Promo Sekarang
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 border border-gray-200 text-gray-600 px-6 py-3 rounded-full text-sm">
            <span>💳</span>
            <span>Pembayaran via QRIS, Transfer Bank, atau COD</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

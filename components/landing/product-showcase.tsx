'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Package,
  Sticker,
  QrCode,
  Check,
  Shield,
  Droplets,
  Sparkles,
} from 'lucide-react';

export interface Product {
  name: string;
  price: string;
  originalPrice?: string;
  icon: React.ElementType;
  features: string[];
  badge: string;
  badgeColor: string;
  highlight: string;
}

interface ProductShowcaseProps {
  className?: string;
}

export function ProductShowcase({ className = '' }: ProductShowcaseProps) {
  const products: Product[] = [
    {
      name: 'Gantungan Akrilik Premium',
      price: 'Rp 35.000',
      originalPrice: 'Rp 50.000',
      icon: Package,
      features: [
        'Material akrilik 3mm premium',
        'Anti-pecah & anti-gores',
        'Cetakan QR tajam & jelas',
        'Custom foto/desain',
        'Ukuran 4cm x 6cm',
        'Tali gantungan kuat',
      ],
      badge: 'Best Seller',
      badgeColor: 'bg-blue-600',
      highlight: 'Kualitas premium, tahan lama',
    },
    {
      name: 'Stiker Vinyl Waterproof',
      price: 'Rp 25.000',
      originalPrice: 'Rp 35.000',
      icon: Sticker,
      features: [
        'Vinyl premium waterproof',
        'Laminasi UV anti-pudar',
        'Cocok untuk helm, koper, laptop',
        'Tahan cuaca ekstrem',
        'Easy peel & stick',
        'Tebal 2mm, durable',
      ],
      badge: 'Populer',
      badgeColor: 'bg-green-600',
      highlight: 'Flexible & universal',
    },
    {
      name: 'Digital Tag (Free)',
      price: 'Rp 0',
      icon: QrCode,
      features: [
        'QR code high-quality',
        'Bisa download PNG/PDF',
        'Cetak sendiri bebas',
        'Maksimal 2 tag gratis',
        'Full dashboard access',
        'Scan logging aktif',
      ],
      badge: 'Gratis',
      badgeColor: 'bg-purple-600',
      highlight: 'Mulai tanpa biaya',
    },
  ];

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Pilihan Produk
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pilih Perlindungan yang Sesuai Kebutuhanmu
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dari tag fisik premium hingga digital gratis, semua dirancang untuk membantu barang hilang kembali ke pemiliknya.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {product.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-10`}>
                    <span className={`${product.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                      {product.badge}
                    </span>
                  </div>
                )}

                <Card
                  className={`h-full hover-card-effect border-2 ${
                    index === 0
                      ? 'border-blue-200 shadow-xl shadow-blue-600/10'
                      : index === 1
                      ? 'border-green-200'
                      : 'border-purple-200'
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex justify-center mb-4"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                          index === 0
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/30'
                            : index === 1
                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-600/30'
                            : 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-600/30'
                        }`}
                      >
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {product.name}
                    </h3>

                    {/* Highlight */}
                    <p
                      className={`text-xs text-center mb-4 font-medium ${
                        index === 0
                          ? 'text-blue-600'
                          : index === 1
                          ? 'text-green-600'
                          : 'text-purple-600'
                      }`}
                    >
                      {product.highlight}
                    </p>

                    {/* Price */}
                    <div className="text-center mb-6">
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through mr-2">
                          {product.originalPrice}
                        </span>
                      )}
                      <span className="text-2xl font-bold gradient-text">{product.price}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check
                            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                              index === 0
                                ? 'text-blue-600'
                                : index === 1
                                ? 'text-green-600'
                                : 'text-purple-600'
                            }`}
                          />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all ${
                        index === 0
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                          : index === 1
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                      }`}
                      onClick={() => {
                        if (index === 2) {
                          window.location.href = '/sign-up';
                        } else if (index === 1) {
                          window.location.href = '/stickers';
                        } else {
                          window.open(
                            'https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20pesan%20' +
                              encodeURIComponent(product.name),
                            '_blank'
                          );
                        }
                      }}
                    >
                      {index === 2 ? 'Buat Gratis Sekarang' : 'Pesan via WhatsApp'}
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-full">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Garansi kualitas - QR code teruji & mudah scan</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

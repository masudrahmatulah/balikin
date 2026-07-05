'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Sticker,
  QrCode,
  Check,
  Shield,
  Droplets,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { type ProductKey } from '@/lib/product-catalog';
import { getCheckoutPath } from '@/lib/client-utils';

export interface Product {
  name: string;
  price: string;
  originalPrice?: string;
  icon: React.ElementType;
  features: string[];
  badge: string;
  badgeColor: string;
  highlight: string;
  comingSoon?: boolean;
  images?: string[];
  category?: string;
  savings?: string;
  productKey?: ProductKey;
}

export interface ProductGroup {
  id: string;
  label: string;
  emoji: string;
  description?: string;
  products: Product[];
}

interface ProductShowcaseProps {
  className?: string;
}

export function ProductShowcase({ className = '' }: ProductShowcaseProps) {
  const router = useRouter();
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<number, number>>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const productGroups: ProductGroup[] = [
    {
      id: 'free-pass',
      label: 'Free Pass',
      emoji: '📱',
      description: 'Mulai gratis, upgrade kapan saja',
      products: [
        {
          name: 'Balikin Free Pass',
          price: 'Rp 0',
          icon: QrCode,
          features: [
            '📱 QR Code digital untuk dicetak sendiri',
            '📧 Notifikasi scan via email',
            '📍 Estimasi lokasi berdasarkan IP Address',
            '🔒 Sistem Anonymous Gateway gratis',
          ],
          badge: 'Gratis',
          badgeColor: 'bg-purple-600',
          highlight: 'Mulai gratis, upgrade kapan saja',
          category: 'digital',
        },
      ],
    },
    {
      id: 'acrylic',
      label: 'Gantungan Akrilik',
      emoji: '🔑',
      description: 'Premium keychains untuk proteksi maksimal',
      products: [
        {
          name: 'Balikin Armor Tag',
          price: 'Rp 54.000',
          icon: Shield,
          features: [
            '🔑 Gantungan kunci akrilik premium',
            '💪 Tahan benturan & cuaca ekstrem',
            '📍 Live tracking dengan GPS',
            '📱 Notifikasi WhatsApp real-time',
            '🚨 Lost Mode emergency display',
          ],
          badge: 'The Anchor',
          badgeColor: 'bg-blue-600',
          highlight: 'Premium keychain untuk kunci motor/mobil',
          category: 'physical',
          productKey: 'armor-tag',
        },
        {
          name: 'Balikin Ultimate Pack',
          price: 'Rp 89.000',
          originalPrice: 'Rp 113.000',
          icon: Package,
          features: [
            '🎁 1 Gantungan Kunci Akrilik Premium',
            '🎁 1 Sheet Stiker Family (12 QR)',
            '📍 Full tracking + WhatsApp alerts',
            '🚨 Lost Mode dengan reward system',
            '⭐ Hemat Rp 24.000 vs beli eceran',
          ],
          badge: '⭐ BEST VALUE',
          badgeColor: 'bg-red-600',
          highlight: 'Proteksi menyeluruh dengan harga hemat',
          savings: 'Hemat Rp 24.000',
          category: 'bundle',
          productKey: 'ultimate-pack',
          comingSoon: true,
        },
      ],
    },
    {
      id: 'stickers',
      label: 'Stiker QR Code',
      emoji: '🏷️',
      description: '4 varian ukuran untuk semua jenis barang',
      products: [
        {
          name: 'Stiker Balikin Pro',
          price: 'Rp 59.000',
          icon: Sticker,
          features: [
            '📦 1 Sheet A5 (Isi 6-8 QR)',
            '📏 Ukuran Besar (3,5 × 3,5 cm)',
            '💎 Vinyl Premium tahan air & UV',
            '🎒 Ideal untuk laptop, helm, koper',
            'Untuk professional dengan aset besar',
          ],
          badge: 'Profesional',
          badgeColor: 'bg-indigo-600',
          highlight: 'Stiker besar untuk aset premium',
          category: 'sticker',
          productKey: 'stiker-pro',
          comingSoon: true,
        },
        {
          name: 'Stiker Balikin Daily',
          price: 'Rp 59.000',
          icon: Sticker,
          features: [
            '📦 1 Sheet A5 (Isi 12-15 QR)',
            '📏 Ukuran Sedang (2,5 × 2,5 cm)',
            '💎 Vinyl Premium tahan air & UV',
            '🎒 Untuk botol, agenda, tablet, kamera',
            'Amankan barang bawaan kantor/sekolah',
          ],
          badge: 'Sehari-hari',
          badgeColor: 'bg-green-600',
          highlight: 'Stiker sedang untuk kebutuhan harian',
          category: 'sticker',
          productKey: 'stiker-daily',
          comingSoon: true,
        },
        {
          name: 'Stiker Balikin Micro',
          price: 'Rp 59.000',
          icon: Sticker,
          features: [
            '📦 1 Sheet A5 (Isi 20-24 QR)',
            '📏 Ukuran Saku (1,8 × 1,8 cm)',
            '💎 Vinyl Premium tahan air & UV',
            '🎒 Untuk TWS, powerbank, charger, flashdisk',
            'Proteksi barang mini yang rentan terselip',
          ],
          badge: 'Mini',
          badgeColor: 'bg-pink-600',
          highlight: 'Stiker kecil untuk barang saku',
          category: 'sticker',
          productKey: 'stiker-micro',
          comingSoon: true,
        },
        {
          name: 'Stiker Balikin Family',
          price: 'Rp 59.000',
          originalPrice: 'Rp 127.000',
          icon: Sticker,
          features: [
            '📦 1 Sheet A5 (Isi 12 QR Campuran)',
            '📏 3 Besar + 4 Sedang + 5 Kecil',
            '💎 Vinyl Premium multi-ukuran',
            '🎁 Amankan semua jenis barang sekali',
            'Hemat hingga Rp 68.000',
          ],
          badge: '⭐ BEST SELLER',
          badgeColor: 'bg-yellow-600',
          highlight: 'Paket stiker terlengkap & terhemat',
          savings: 'Hemat Rp 68.000',
          category: 'sticker',
          productKey: 'stiker-family',
          comingSoon: true,
        },
      ],
    },
    {
      id: 'bundles',
      label: 'Paket Bundle',
      emoji: '📦',
      description: 'Hemat lebih banyak dengan paket B2B',
      products: [
        {
          name: 'Paket Keluarga',
          price: 'Rp 299.000',
          originalPrice: 'Rp 356.000',
          icon: Package,
          features: [
            '🏠 4 Set Ultimate Pack',
            '👨‍👩‍👧‍👦 Dibagi untuk Ayah, Ibu, & 2 Anak',
            '📍 Proteksi total untuk keluarga',
            '💰 Hemat Rp 57.000',
            'Tingkatkan basket size & margin keuntungan',
          ],
          badge: 'Keluarga',
          badgeColor: 'bg-cyan-600',
          highlight: 'Perlindungan menyeluruh satu keluarga',
          savings: 'Hemat Rp 57.000',
          category: 'bundle',
          productKey: 'paket-keluarga',
          comingSoon: true,
        },
        {
          name: 'Paket Traveller',
          price: 'Rp 699.000',
          originalPrice: 'Rp 890.000',
          icon: Package,
          features: [
            '🚀 10 Set Ultimate Pack',
            '🤝 Untuk bisnis rental, trip, logistik',
            '📊 Solusi B2B commercial',
            '💰 Hemat Rp 191.000',
            'Volume tinggi untuk reseller & business',
          ],
          badge: 'B2B',
          badgeColor: 'bg-gray-700',
          highlight: 'Paket grosir untuk bisnis & reseller',
          savings: 'Hemat Rp 191.000',
          category: 'bundle',
          productKey: 'paket-traveller',
          comingSoon: true,
        },
      ],
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
            <Shield className="h-4 w-4" />
            4 Kategori Produk
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Paket Proteksi untuk Setiap Kebutuhan & Budget
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Dari gratis digital hingga paket B2B komersial. Setiap produk dilengkapi <span className="font-semibold">Anonymous WhatsApp Gateway, Live Tracking, Lost Mode, dan Reward System</span>. Pilih yang paling sesuai kebutuhanmu.
          </p>
        </motion.div>

        {/* Product Groups */}
        {productGroups.map((group, groupIndex) => {
          const gridColsClass = group.id === 'free-pass'
            ? 'md:max-w-xs mx-auto'
            : group.id === 'acrylic'
            ? 'md:grid-cols-2'
            : group.id === 'stickers'
            ? 'md:grid-cols-2 lg:grid-cols-4'
            : 'md:grid-cols-2';

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: groupIndex * 0.15 }}
              className="mb-16"
            >
              {/* Group Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-3xl">{group.emoji}</span>
                  <h3 className="text-2xl font-bold text-gray-900">{group.label}</h3>
                </div>
                {group.description && (
                  <p className="text-gray-600 text-sm ml-12">{group.description}</p>
                )}
              </div>

              {/* Group Products Grid */}
              <div className={`grid gap-6 ${gridColsClass}`}>
                {group.products.map((product, productIndex) => {
                  const Icon = product.icon;
                  const globalIndex = productGroups.slice(0, groupIndex).reduce((sum, g) => sum + g.products.length, 0) + productIndex;
                  return (
                    <motion.div
                      key={productIndex}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: productIndex * 0.1 }}
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
                  className={`h-full hover-card-effect border-2 transition-all duration-300 ${
                    product.badge.includes('BEST') || product.badge.includes('⭐')
                      ? 'shadow-lg'
                      : ''
                  } ${
                    product.category === 'digital'
                      ? 'border-purple-200'
                      : product.category === 'physical'
                      ? 'border-blue-200 shadow-xl shadow-blue-600/10'
                      : product.category === 'sticker'
                      ? 'border-green-200'
                      : 'border-orange-200'
                  }`}
                >
                  <CardContent className="p-6">
                    {/* Product Image Gallery (only for products with images) */}
                    {product.images && product.images.length > 0 && (
                      <div className="mb-4">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                          {/* Main Image */}
                          <div
                            className="relative aspect-[4/3] cursor-pointer group"
                            onClick={() => setZoomedImage(product.images![currentImageIndices[globalIndex] || 0])}
                          >
                            <Image
                              src={product.images[currentImageIndices[globalIndex] || 0]}
                              alt={`${product.name} - Image ${currentImageIndices[globalIndex] || 0 + 1}`}
                              width={400}
                              height={300}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>

                          {/* Navigation Arrows */}
                          {product.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndices((prev) => ({
                                    ...prev,
                                    [globalIndex]: ((prev[globalIndex] || 0) - 1 + product.images!.length) % product.images!.length,
                                  }));
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                              >
                                <ChevronLeft className="h-4 w-4 text-gray-700" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndices((prev) => ({
                                    ...prev,
                                    [globalIndex]: ((prev[globalIndex] || 0) + 1) % product.images!.length,
                                  }));
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                              >
                                <ChevronRight className="h-4 w-4 text-gray-700" />
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          {product.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {(currentImageIndices[globalIndex] || 0) + 1} / {product.images.length}
                            </div>
                          )}
                        </div>

                        {/* Thumbnail Strip */}
                        {product.images.length > 1 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                            {product.images.map((image, imgIndex) => (
                              <button
                                key={imgIndex}
                                onClick={() =>
                                  setCurrentImageIndices((prev) => ({ ...prev, [globalIndex]: imgIndex }))
                                }
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  (currentImageIndices[globalIndex] || 0) === imgIndex
                                    ? 'border-blue-500 scale-105'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <Image
                                  src={image}
                                  alt={`${product.name} thumbnail ${imgIndex + 1}`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Icon (show only if no images) */}
                    {!product.images && (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex justify-center mb-4"
                      >
                        <div
                          className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                            product.category === 'digital'
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-600/30'
                              : product.category === 'physical'
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-600/30'
                              : product.category === 'sticker'
                              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-600/30'
                              : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-600/30'
                          }`}
                        >
                          <Icon className="h-10 w-10 text-white" />
                        </div>
                      </motion.div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                      {product.name}
                      {product.comingSoon && (
                        <span className="text-gray-400 text-sm ml-2">(Coming Soon)</span>
                      )}
                    </h3>

                    {/* Highlight */}
                    <p
                      className={`text-xs text-center mb-4 font-medium ${
                        product.category === 'digital'
                          ? 'text-purple-600'
                          : product.category === 'physical'
                          ? 'text-blue-600'
                          : product.category === 'sticker'
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {product.highlight}
                    </p>

                    {/* Price */}
                    <div className="text-center mb-6">
                      {product.originalPrice && (
                        <div className="mb-2">
                          <span className="text-sm text-gray-400 line-through">
                            {product.originalPrice}
                          </span>
                        </div>
                      )}
                      <span className="text-2xl font-bold gradient-text">{product.price}</span>
                      {product.savings && (
                        <div className="text-xs text-green-600 font-semibold mt-2">
                          ✓ {product.savings}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check
                            className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                              product.category === 'digital'
                                ? 'text-purple-600'
                                : product.category === 'physical'
                                ? 'text-blue-600'
                                : product.category === 'sticker'
                                ? 'text-green-600'
                                : 'text-orange-600'
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
                      disabled={product.comingSoon}
                      className={`w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        product.category === 'digital'
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                          : product.category === 'physical'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                          : product.category === 'sticker'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                      }`}
                      onClick={() => {
                        if (product.category === 'digital') {
                          router.push('/sign-up');
                        } else if (product.productKey) {
                          router.push(getCheckoutPath(product.productKey));
                        }
                      }}
                    >
                      {product.comingSoon ? 'Coming Soon' : product.category === 'digital' ? 'Buat Gratis Sekarang' : 'Pesan Sekarang'}
                    </motion.button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Product Categories Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-8 border-t border-gray-200"
        >
          <h3 className="text-center text-lg font-semibold text-gray-900 mb-8">Kategori Produk Kami</h3>
          <div className="flex flex-wrap justify-center gap-4 text-center max-w-4xl mx-auto">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex-1 min-w-[140px] flex flex-col items-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-sm font-semibold text-purple-900">Free Pass</p>
              <p className="text-xs text-gray-600">Mulai Gratis</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex-1 min-w-[140px] flex flex-col items-center">
              <div className="text-3xl mb-2">🔑</div>
              <p className="text-sm font-semibold text-blue-900">Gantungan Akrilik</p>
              <p className="text-xs text-gray-600">2 Paket</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex-1 min-w-[140px] flex flex-col items-center">
              <div className="text-3xl mb-2">🏷️</div>
              <p className="text-sm font-semibold text-green-900">Stiker QR Code</p>
              <p className="text-xs text-gray-600">4 Varian Ukuran</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 flex-1 min-w-[140px] flex flex-col items-center">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm font-semibold text-orange-900">Paket Bundle</p>
              <p className="text-xs text-gray-600">2 Paket B2B</p>
            </div>
          </div>
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-full">
            <Shield className="h-5 w-5" />
            <span className="font-medium">✓ Garansi: Sistem Anonymous Gateway aktif 24/7 & privasi end-to-end encrypted</span>
          </div>
        </motion.div>

        {/* Zoom Modal */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="max-w-4xl max-h-[90vh] object-contain rounded-lg shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={zoomedImage}
                  alt="Zoomed product image"
                  width={1600}
                  height={1200}
                  className="max-w-4xl max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
              </motion.div>
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Close zoom"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

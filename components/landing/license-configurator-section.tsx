'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, Sparkles, QrCode, MessageCircleHeart, Infinity as InfinityIcon, ZoomIn } from 'lucide-react';
import { SimpleUrgencyBadge } from '@/components/landing/urgency-badge';
import { ImageLightbox, type LightboxImage } from '@/components/landing/image-lightbox';

const BASE_PRICE = 35000;

type MaterialId = 'vinyl' | 'acrylic' | 'stainless';
type ShapeId = 'bulat' | 'oval' | 'persegi-panjang' | 'persegi-panjang-motif' | 'persegi-panjang-timbul' | 'segi-delapan' | 'heart';

const materials: {
  id: MaterialId;
  name: string;
  desc: string;
  addOn: number;
  hasShapes?: boolean;
  comingSoon?: boolean;
}[] = [
  { id: 'vinyl', name: 'Premium Vinyl Sticker', desc: 'Standar, sudah termasuk di harga lisensi', addOn: 0 },
  {
    id: 'acrylic',
    name: 'Wadah Premium Acrylic Tag',
    desc: 'Bulat, Oval, Kotak, atau Heart',
    addOn: 10000,
    hasShapes: true,
  },
  { id: 'stainless', name: 'Wadah Tactical Stainless / Metal', desc: 'Untuk koper atau barang outdoor', addOn: 29000, comingSoon: true },
];

const shapes: { id: ShapeId; name: string; image: string }[] = [
  { id: 'bulat', name: 'Bulat', image: '/satu2/with_bg/bulat.webp' },
  { id: 'oval', name: 'Oval', image: '/satu2/with_bg/oval.webp' },
  { id: 'persegi-panjang', name: 'Persegi Panjang', image: '/satu2/with_bg/persegi panjang.webp' },
  { id: 'persegi-panjang-motif', name: 'Persegi Panjang Motif', image: '/satu2/with_bg/persegi panjang motif.webp' },
  { id: 'persegi-panjang-timbul', name: 'Persegi Panjang Timbul', image: '/satu2/with_bg/persegi panjang timbul.webp' },
  { id: 'segi-delapan', name: 'Segi Delapan', image: '/satu2/with_bg/segi delapan.webp' },
  { id: 'heart', name: 'Heart', image: '/satu2/with_bg/hati.webp' },
];

const CUSTOM_PRINT_PRICE = 5000;

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}

export function LicenseConfiguratorSection() {
  const [material, setMaterial] = useState<MaterialId>('vinyl');
  const [shape, setShape] = useState<ShapeId>('bulat');
  const [customPrint, setCustomPrint] = useState(false);
  const [previewShape, setPreviewShape] = useState<ShapeId | null>(null);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);

  const selectedMaterial = materials.find((m) => m.id === material)!;
  const activeShape = shapes.find((s) => s.id === (previewShape ?? shape))!;

  const total = useMemo(() => {
    let sum = BASE_PRICE + selectedMaterial.addOn;
    if (customPrint) sum += CUSTOM_PRINT_PRICE;
    return sum;
  }, [selectedMaterial, customPrint]);

  return (
    <section id="konfigurator" className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-16">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" aria-hidden="true" />
      <div className="container relative mx-auto px-4">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center mb-12">
            <Badge className="mb-4 bg-indigo-600 text-white hover:bg-indigo-600">
              <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
              Konfigurator Interaktif
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Rakit Lisensi <span className="bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent">Balikin</span> Anda Sendiri
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Harga dasar Rp35.000 sudah termasuk 1 Lisensi Akun/ID QR unik di platform balikin.online + media standar. Pilih wadah dan opsi desain, harga otomatis menyesuaikan.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-white/70 dark:bg-white/5 dark:border-white/10 p-4 shadow-sm">
              <QrCode className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">1 Lisensi Akun/ID QR</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unik, aman, berlaku seumur hidup</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-white/70 dark:bg-white/5 dark:border-white/10 p-4 shadow-sm">
              <MessageCircleHeart className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">Anonymous Chat Protection</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Penemu hubungi Anda tanpa lihat nomor HP</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-white/70 dark:bg-white/5 dark:border-white/10 p-4 shadow-sm">
              <InfinityIcon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">Bebas Baterai, Seumur Hidup</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Media fisik dicetak sesuai pilihan Anda</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <SimpleUrgencyBadge spots={72} />
          </div>
        </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">1. Pilih Wadah Fisik</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => !m.comingSoon && setMaterial(m.id)}
                    disabled={m.comingSoon}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all bg-white dark:bg-white/5 ${
                      m.comingSoon
                        ? 'border-gray-200 dark:border-white/10 opacity-60 cursor-not-allowed'
                        : material === m.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-100'
                          : 'border-gray-200 dark:border-white/10 hover:border-indigo-300'
                    }`}
                    aria-pressed={material === m.id}
                  >
                    {m.comingSoon && (
                      <span className="absolute top-2 right-2 rounded-full bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5">
                        Segera Hadir
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{m.name}</span>
                      {!m.comingSoon && material === m.id && <Check className="h-4 w-4 text-indigo-600" aria-hidden="true" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{m.desc}</p>
                    <span className="text-sm font-semibold text-orange-600">
                      {m.comingSoon ? '' : m.addOn === 0 ? 'Termasuk' : `+${formatRupiah(m.addOn)}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {material === 'vinyl' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  type="button"
                  onClick={() => setLightboxImage({ src: '/desains/sticker1.webp', alt: 'Premium Vinyl Sticker' })}
                  className="group relative h-56 w-56 sm:h-64 sm:w-64 mx-auto sm:mx-0 block rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-lg shadow-indigo-100/50 cursor-zoom-in"
                >
                  <Image
                    src="/desains/sticker1.webp"
                    alt="Premium Vinyl Sticker"
                    fill
                    className="object-contain p-4"
                    sizes="(min-width: 640px) 256px, 224px"
                  />
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                  </span>
                </button>
              </motion.div>
            )}

            {selectedMaterial.hasShapes && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">2. Pilih Bentuk Acrylic</h3>
                <div className="flex flex-col-reverse sm:flex-row gap-5 items-center sm:items-start">
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {shapes.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setShape(s.id)}
                        onMouseEnter={() => setPreviewShape(s.id)}
                        onMouseLeave={() => setPreviewShape(null)}
                        onFocus={() => setPreviewShape(s.id)}
                        onBlur={() => setPreviewShape(null)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          shape === s.id
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                            : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                        }`}
                        aria-pressed={shape === s.id}
                      >
                        {shape === s.id && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        {s.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightboxImage({ src: activeShape.image, alt: activeShape.name })}
                    className="group relative h-56 w-56 sm:h-64 sm:w-64 flex-shrink-0 block rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-lg shadow-indigo-100/50 cursor-zoom-in"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeShape.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={activeShape.image}
                          alt={activeShape.name}
                          fill
                          className="object-contain p-4"
                          sizes="(min-width: 640px) 256px, 224px"
                        />
                      </motion.div>
                    </AnimatePresence>
                    <span className="absolute bottom-3 right-3 z-10 rounded-full bg-white/90 p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {selectedMaterial.hasShapes ? '3.' : '2.'} Opsi Desain
              </h3>
              <button
                type="button"
                onClick={() => setCustomPrint((v) => !v)}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all bg-white dark:bg-white/5 ${
                  customPrint ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-100' : 'border-gray-200 dark:border-white/10 hover:border-indigo-300'
                }`}
                aria-pressed={customPrint}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">Cetak Kustom Nama / Foto Sendiri</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tercetak langsung di atas tag fisik</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-orange-600">+{formatRupiah(CUSTOM_PRINT_PRICE)}</span>
                    {customPrint && <Check className="h-4 w-4 text-indigo-600" aria-hidden="true" />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-300/40 sticky top-24 overflow-hidden">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4">Ringkasan Lisensi</h3>
                <ul className="space-y-2 text-sm text-indigo-100 mb-4">
                  <li className="flex justify-between">
                    <span>Lisensi Akun/ID QR + Vinyl</span>
                    <span>{formatRupiah(BASE_PRICE)}</span>
                  </li>
                  {selectedMaterial.addOn > 0 && (
                    <li className="flex justify-between">
                      <span>
                        {selectedMaterial.name}
                        {selectedMaterial.hasShapes ? ` (${shapes.find((s) => s.id === shape)?.name})` : ''}
                      </span>
                      <span>+{formatRupiah(selectedMaterial.addOn)}</span>
                    </li>
                  )}
                  {customPrint && (
                    <li className="flex justify-between">
                      <span>Cetak Kustom Nama/Foto</span>
                      <span>+{formatRupiah(CUSTOM_PRINT_PRICE)}</span>
                    </li>
                  )}
                </ul>
                <div className="border-t border-white/20 pt-4 mb-6 flex items-center justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.15, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-amber-300"
                  >
                    {formatRupiah(total)}
                  </motion.span>
                </div>
                <Link href="/stickers" className="block">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-900/30 border-0" size="lg">
                    <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
                    Aktifkan Lisensi Ini
                  </Button>
                </Link>
                <p className="text-xs text-indigo-200 mt-3 text-center">
                  Satu kali bayar, berlaku seumur hidup. Cetak fisik diproses print-on-demand sesuai pilihan Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>
      </div>
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </section>
  );
}

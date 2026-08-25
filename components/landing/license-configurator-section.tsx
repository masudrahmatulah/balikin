'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShoppingCart, Sparkles, QrCode, MessageCircleHeart, Infinity as InfinityIcon, ZoomIn, PackagePlus, Trash2, MessageCircle } from 'lucide-react';
import { SimpleUrgencyBadge } from '@/components/landing/urgency-badge';
import { ImageLightbox, type LightboxImage } from '@/components/landing/image-lightbox';
import { PRODUCT_CATALOG } from '@/lib/product-catalog';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';

type MaterialId = 'vinyl' | 'acrylic' | 'stainless';
type ShapeId = 'bulat' | 'oval' | 'persegi-panjang' | 'persegi-panjang-motif' | 'persegi-panjang-timbul' | 'segi-delapan' | 'heart';

const materials: {
  id: MaterialId;
  name: string;
  desc: string;
  hasShapes?: boolean;
  comingSoon?: boolean;
}[] = [
  { id: 'vinyl', name: 'Premium Vinyl Sticker', desc: 'Standar, sudah termasuk di harga lisensi' },
  {
    id: 'acrylic',
    name: 'Wadah Premium Acrylic Tag',
    desc: 'Bulat, Oval, Kotak, atau Heart',
    hasShapes: true,
  },
  { id: 'stainless', name: 'Wadah Tactical Stainless / Metal', desc: 'Untuk koper atau barang outdoor', comingSoon: true },
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

type StickerPackId = 'stiker-pro' | 'stiker-daily' | 'stiker-family' | 'stiker-micro';

const stickerPacks: { id: StickerPackId; label: string; desc: string }[] = [
  { id: 'stiker-pro', label: `Pro (isi ${PRODUCT_CATALOG['stiker-pro'].packSize})`, desc: 'Cocok untuk kebutuhan ringan' },
  { id: 'stiker-family', label: `Family (isi ${PRODUCT_CATALOG['stiker-family'].packSize})`, desc: 'Paling populer' },
  { id: 'stiker-daily', label: `Daily (isi ${PRODUCT_CATALOG['stiker-daily'].packSize})`, desc: 'Untuk pemakaian harian' },
  { id: 'stiker-micro', label: `Micro (isi ${PRODUCT_CATALOG['stiker-micro'].packSize})`, desc: 'Paling banyak isinya' },
];

const DEFAULT_STICKER_PACK: StickerPackId = 'stiker-family';

// Vinyl selalu flat Rp59.000 per pack (lihat PRODUCT_CATALOG), acrylic flat harga armor-tag,
// jadi harga ditampilkan berdasarkan produk asli di katalog, bukan hitungan base+addon.
const MATERIAL_STARTING_PRICE: Record<MaterialId, { price: number; unit: string } | null> = {
  vinyl: { price: PRODUCT_CATALOG['stiker-family'].price, unit: '/ pack' },
  acrylic: { price: PRODUCT_CATALOG['armor-tag'].price, unit: '/ pcs' },
  stainless: null,
};

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}

export function LicenseConfiguratorSection() {
  const [material, setMaterial] = useState<MaterialId>('vinyl');
  const [shape, setShape] = useState<ShapeId>('bulat');
  const [stickerPack, setStickerPack] = useState<StickerPackId>(DEFAULT_STICKER_PACK);
  const [previewShape, setPreviewShape] = useState<ShapeId | null>(null);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);
  const [mixCart, setMixCart] = useState<{ packId: StickerPackId; qty: number }[]>([]);

  const selectedMaterial = materials.find((m) => m.id === material)!;
  const activeShape = shapes.find((s) => s.id === (previewShape ?? shape))!;

  const checkoutProductKey = material === 'vinyl' ? stickerPack : 'armor-tag';
  const checkoutProduct = PRODUCT_CATALOG[checkoutProductKey];
  const packSize = checkoutProduct.packSize;

  const total = checkoutProduct.price;

  const addToMixCart = () => {
    setMixCart((prev) => {
      const existing = prev.find((item) => item.packId === stickerPack);
      if (existing) {
        return prev.map((item) => (item.packId === stickerPack ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { packId: stickerPack, qty: 1 }];
    });
  };

  const updateMixCartQty = (packId: StickerPackId, delta: number) => {
    setMixCart((prev) =>
      prev
        .map((item) => (item.packId === packId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromMixCart = (packId: StickerPackId) => {
    setMixCart((prev) => prev.filter((item) => item.packId !== packId));
  };

  const mixCartTotal = mixCart.reduce((sum, item) => sum + PRODUCT_CATALOG[item.packId].price * item.qty, 0);

  const mixCartWhatsappHref = useMemo(() => {
    if (mixCart.length === 0) return '';
    const lines = mixCart
      .map((item) => {
        const p = stickerPacks.find((sp) => sp.id === item.packId)!;
        return `- ${item.qty}x Stiker Balikin ${p.label}`;
      })
      .join('\n');
    const message = `Halo, saya ingin pesan kombinasi paket stiker Balikin:\n${lines}\nTotal estimasi: ${formatRupiah(mixCartTotal)}. Mohon info proses pemesanannya.`;
    return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [mixCart, mixCartTotal]);

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
              Setiap pack sudah termasuk Lisensi Akun/ID QR unik di platform balikin.online untuk setiap tag. Pilih wadah, paket, dan opsi desain, harga otomatis menyesuaikan.
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
                <p className="font-medium text-sm text-gray-900 dark:text-white">Privasi Terjaga</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nomor HP Anda tidak tercetak di tag fisik</p>
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
                      {MATERIAL_STARTING_PRICE[m.id]
                        ? `${formatRupiah(MATERIAL_STARTING_PRICE[m.id]!.price)} ${MATERIAL_STARTING_PRICE[m.id]!.unit}`
                        : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {material === 'vinyl' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">2. Pilih Jumlah Pack</h3>
                    <Link
                      href="/stickers"
                      className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Lihat detail & isi tiap paket →
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stickerPacks.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setStickerPack(p.id)}
                        className={`inline-flex flex-col items-start gap-0.5 px-4 py-2 rounded-xl border-2 text-left transition-all ${
                          stickerPack === p.id
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                            : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                        }`}
                        aria-pressed={stickerPack === p.id}
                      >
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {stickerPack === p.id && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          {p.label}
                        </span>
                        <span className={`text-xs ${stickerPack === p.id ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {p.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addToMixCart}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    <PackagePlus className="h-4 w-4" aria-hidden="true" />
                    Mau campur beberapa paket? Tambahkan ke pesanan
                  </button>

                  {mixCart.length > 0 && (
                    <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 p-3 space-y-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pesanan campuran Anda:</p>
                      {mixCart.map((item) => {
                        const p = stickerPacks.find((sp) => sp.id === item.packId)!;
                        return (
                          <div key={item.packId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">{p.label}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 rounded-md bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateMixCartQty(item.packId, -1)}
                                  aria-label={`Kurangi ${p.label}`}
                                  className="h-5 w-5 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                >
                                  −
                                </button>
                                <span className="w-4 text-center text-xs font-semibold">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateMixCartQty(item.packId, 1)}
                                  aria-label={`Tambah ${p.label}`}
                                  className="h-5 w-5 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromMixCart(item.packId)}
                                aria-label={`Hapus ${p.label} dari pesanan campuran`}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-2 border-t border-indigo-200 dark:border-indigo-500/30 text-sm font-semibold text-gray-900 dark:text-white">
                        <span>Estimasi Total</span>
                        <span>{formatRupiah(mixCartTotal)}</span>
                      </div>
                      <a
                        href={mixCartWhatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        Pesan Campuran via WhatsApp
                      </a>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                        Pesanan campuran diproses manual oleh admin via WhatsApp, terpisah dari checkout otomatis.
                      </p>
                    </div>
                  )}
                </div>
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
          </div>

          <div className="lg:col-span-1">
            <Card className="border-0 bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-300/40 sticky top-24 overflow-hidden">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4">Ringkasan Lisensi</h3>

                <div className="mb-4 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-indigo-100">
                  Dijual per pack berisi <span className="font-semibold text-white">{packSize} pcs</span>, bukan satuan. Harga mengikuti paket yang Anda pilih.
                </div>

                <ul className="space-y-2 text-sm text-indigo-100 mb-4">
                  <li className="flex justify-between">
                    <span>
                      {material === 'vinyl'
                        ? `Vinyl Sticker Pack ${stickerPacks.find((p) => p.id === stickerPack)?.label}`
                        : `${selectedMaterial.name}${selectedMaterial.hasShapes ? ` (${shapes.find((s) => s.id === shape)?.name})` : ''}`}
                    </span>
                    <span>{formatRupiah(checkoutProduct.price)}</span>
                  </li>
                </ul>
                <div className="border-t border-white/20 pt-4 mb-6">
                  <div className="flex items-center justify-between">
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
                  <p className="text-xs text-indigo-200 mt-1 text-right">
                    {formatRupiah(Math.round(checkoutProduct.price / packSize))} / pcs dalam pack
                  </p>
                </div>
                <Link href={`/stickers/checkout?product=${checkoutProductKey}`} className="block">
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

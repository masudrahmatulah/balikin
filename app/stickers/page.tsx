import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeCheck, Droplets, Sticker, SunMedium, MessageCircle, Layers, Sparkles, Check } from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';
import { PRODUCT_CATALOG, type ProductKey } from '@/lib/product-catalog';
import { getStickerProductInfo, FAMILY_ROW_PRODUCTS, type StickerProductKey } from '@/lib/sticker-template';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sticker Vinyl Pack',
  description: 'Sticker Vinyl Balikin isi 8-24 pcs untuk helm, laptop, koper, dan barang sehari-hari. Waterproof, anti-UV, dan terhubung ke WhatsApp alert.',
  path: '/stickers',
  keywords: ['sticker vinyl qr', 'stiker barang hilang', 'sticker helm qr', 'sticker koper qr'],
});

const WHATSAPP_MESSAGE = 'Halo, saya tertarik pesan Sticker Vinyl Pack Balikin.';

const features = [
  {
    icon: BadgeCheck,
    label: 'Silver Verified Badge',
    description: 'Meningkatkan kepercayaan penemu saat melihat halaman publik sticker Anda.',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp Scan Alert',
    description: 'Begitu sticker di-scan saat mode hilang, Anda langsung dapat alert instan via WhatsApp.',
  },
  {
    icon: Droplets,
    label: 'Waterproof',
    description: 'Material vinyl tahan air untuk pemakaian harian di helm, botol, koper, dan gadget.',
  },
  {
    icon: SunMedium,
    label: 'Anti-UV',
    description: 'Laminasi membantu QR tetap tajam dan tidak cepat pudar terkena matahari.',
  },
];

const stickerProductKeys = ['stiker-pro', 'stiker-family', 'stiker-daily', 'stiker-micro'] as const;

const PRODUCT_USE_CASE: Record<(typeof stickerProductKeys)[number], string> = {
  'stiker-pro': 'Cocok untuk barang besar: koper, tas ransel, sepeda',
  'stiker-daily': 'Cocok untuk pemakaian harian: laptop, botol minum, dompet',
  'stiker-family': 'Campuran ukuran untuk berbagai jenis barang sekaligus',
  'stiker-micro': 'Cocok untuk barang kecil: kunci, earphone case, kabel charger',
};

function getPackComposition(productKey: (typeof stickerProductKeys)[number]) {
  const catalogEntry = PRODUCT_CATALOG[productKey];
  const sheetInfo = getStickerProductInfo(productKey as StickerProductKey);

  if (productKey !== 'stiker-family') {
    return {
      summary: `Semua ${catalogEntry.packSize} pcs berukuran seragam ${sheetInfo.size}`,
      breakdown: null as { label: string; size: string; count: number }[] | null,
    };
  }

  const perSheetTotal = FAMILY_ROW_PRODUCTS.length;
  const sheetsPerPack = catalogEntry.packSize / perSheetTotal;
  const countOf = (key: StickerProductKey) =>
    FAMILY_ROW_PRODUCTS.filter((p) => p === key).length * sheetsPerPack;

  return {
    summary: 'Campuran 3 ukuran dalam 1 pack, siap tempel di berbagai jenis barang',
    breakdown: [
      { label: 'Pro', size: getStickerProductInfo('stiker-pro').size, count: countOf('stiker-pro') },
      { label: 'Daily', size: getStickerProductInfo('stiker-daily').size, count: countOf('stiker-daily') },
      { label: 'Micro', size: getStickerProductInfo('stiker-micro').size, count: countOf('stiker-micro') },
    ],
  };
}

export default function StickersPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <MarketingShell
      title="Jangan Biarkan Barang Kesayanganmu Hilang Tanpa Jejak."
      description="Sticker Pintar Balikin: murah, kuat, dan menghubungkan Anda langsung dengan penemu jujur. Pilih paket yang paling pas dengan jumlah dan jenis barang yang ingin Anda amankan."
    >
      <div className="not-prose">
        <section className="relative -mx-4 overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/20" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" aria-hidden="true" />

          <ScrollReveal>
            <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Badge className="mb-4 bg-indigo-600 text-white hover:bg-indigo-600">
                  <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                  Katalog Sticker Vinyl
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-3 dark:text-white">
                  Pilih Paket <span className="bg-gradient-to-r from-indigo-600 to-orange-500 bg-clip-text text-transparent">Sticker Vinyl</span> Sesuai Kebutuhan
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Setiap sticker terhubung ke Lisensi Akun/ID QR Balikin, proteksi privasi nomor HP, dan alert WhatsApp saat barang Anda ditemukan.
                </p>
              </div>
              <div className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-lg shadow-indigo-100/50 dark:from-white/5 dark:to-white/5 dark:border-white/10">
                <Image
                  src="/desains/sticker1.webp"
                  alt="Premium Vinyl Sticker"
                  fill
                  className="object-contain p-4"
                  sizes="192px"
                />
              </div>
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2 mt-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-white/70 dark:bg-white/5 dark:border-white/10 p-4 shadow-sm">
                <feature.icon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{feature.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="grid gap-6 md:grid-cols-2 mt-10 max-w-4xl mx-auto">
            {stickerProductKeys.map((key) => {
              const product = PRODUCT_CATALOG[key as ProductKey];
              const composition = getPackComposition(key);
              const isPopular = key === 'stiker-family';

              return (
                <Card
                  key={key}
                  className={`relative bg-white dark:bg-white/5 transition-all ${
                    isPopular
                      ? 'border-2 border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-indigo-950/40'
                      : 'border-2 border-gray-200 dark:border-white/10'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Paling Populer
                    </span>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl dark:text-white">
                      <Sticker className="h-5 w-5 text-indigo-600 flex-shrink-0" aria-hidden="true" />
                      {product.name} Isi {product.packSize}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{PRODUCT_USE_CASE[key]}</p>

                    <div className="rounded-xl border border-indigo-100 dark:border-white/10 bg-indigo-50/50 dark:bg-white/5 p-3">
                      <div className="flex items-start gap-2">
                        <Layers className="mt-0.5 h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <p className="font-medium">{composition.summary}</p>
                          {composition.breakdown && (
                            <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                              {composition.breakdown.map((item) => (
                                <li key={item.label} className="flex justify-between gap-2">
                                  <span className="flex items-center gap-1">
                                    <Check className="h-3 w-3 text-indigo-500" aria-hidden="true" />
                                    {item.count}x {item.label}
                                  </span>
                                  <span className="font-mono">{item.size}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">Rp{product.price.toLocaleString('id-ID')}</p>
                      <Button
                        asChild
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-900/20 border-0 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      >
                        <Link href={`/stickers/checkout?product=${key}`}>Pilih Paket Ini</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-center mt-10 max-w-4xl mx-auto shadow-xl shadow-indigo-300/40">
            <p className="text-sm text-indigo-50">
              Ingin campur beberapa paket sekaligus (misal 1 Pro + 2 Daily)? Chat admin kami, pesanan campuran diproses manual.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer external">
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Tanya / Pesan Campuran via WhatsApp
              </a>
            </Button>
            <p className="mt-4 text-xs text-indigo-200">Pembayaran awal memakai QRIS manual dan diverifikasi admin Balikin.</p>
          </div>
        </ScrollReveal>
      </div>
    </MarketingShell>
  );
}

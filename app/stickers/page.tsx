import type { Metadata } from 'next';
import Image from 'next/image';
import { BadgeCheck, Droplets, SunMedium, Sparkles, MessageCircle } from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { PRODUCT_CATALOG, type ProductKey } from '@/lib/product-catalog';
import { getStickerProductInfo, FAMILY_ROW_PRODUCTS, type StickerProductKey } from '@/lib/sticker-template';
import { buildMetadata } from '@/lib/seo';
import { StickerPurchaseCard } from '@/components/sticker-purchase-card';

export const metadata: Metadata = buildMetadata({
  title: 'Sticker Vinyl Pack',
  description: 'Sticker Vinyl Balikin isi 4-8 pcs untuk helm, laptop, koper, dan barang sehari-hari. Pilih paket dan warna sticker sesuai kebutuhan.',
  path: '/stickers',
  keywords: ['sticker vinyl qr', 'stiker barang hilang', 'sticker helm qr', 'sticker koper qr'],
});

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

export default async function StickersPage() {
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
                  Setiap sticker terhubung ke Lisensi Akun/ID QR Balikin. Nomor WhatsApp tidak dicetak permanen di sticker, dan Anda mendapat alert saat QR dipindai.
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
                <StickerPurchaseCard
                      key={key}
                      product={product}
                      productKey={key}
                      useCase={PRODUCT_USE_CASE[key]}
                      composition={composition}
                      isPopular={isPopular}
                    />
              );
            })}
          </div>
        </ScrollReveal>

      </div>
    </MarketingShell>
  );
}

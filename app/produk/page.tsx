import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Clock3, FileImage, Package, ShoppingCart, Sticker } from 'lucide-react';
import { MarketingShell } from '@/components/marketing-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRODUCT_CATALOG, type ProductKey } from '@/lib/product-catalog';
import { ACRYLIC_SHAPES } from '@/lib/acrylic-shapes';
import { getAcrylicStock } from '@/lib/product-stock';
import { getStickerProductInfo } from '@/lib/sticker-template';
import { absoluteUrl, buildMetadata } from '@/lib/seo';
import { LicenseConfiguratorSection } from '@/components/landing/license-configurator-section';
import { PREVIOUS_PREMIUM_PRICE, PREMIUM_PRICE, PRINTABLE_FIVE_PRICE, PRINTABLE_SINGLE_PRICE, PRINTABLE_TEN_PRICE } from '@/lib/constants';
import { ProductJsonLd, SiteGraphJsonLd } from '@/components/json-ld';

export const metadata: Metadata = buildMetadata({
  title: 'Marketplace Produk Balikin',
  description: 'Pilih sticker QR made-to-order atau produk akrilik ready-stock Balikin sesuai kebutuhan Anda.',
  path: '/produk',
  keywords: ['marketplace Balikin', 'sticker QR Balikin', 'akrilik QR ready stock', 'produk QR anti hilang'],
});

const stickerKeys = ['stiker-pro', 'stiker-family', 'stiker-daily', 'stiker-micro'] as const;

const stickerImages: Record<string, string> = {
  'stiker-pro': '/sticker1.webp',
  'stiker-family': '/variansticker.png',
  'stiker-daily': '/sticker2.png',
  'stiker-micro': '/desains/sticker1.webp',
};

const acrylicImages: Record<string, string> = {
  circle: '/variasi_akrilik/lingkaran.webp',
  oval: '/variasi_akrilik/oval.webp',
  octagon: '/variasi_akrilik/persegi delapan.webp',
  heart: '/variasi_akrilik/hati.webp',
  rectangle: '/variasi_akrilik/persegi panjang.webp',
  'rectangle-motif': '/variasi_akrilik/persegi panjang motif.webp',
  square: '/satu2/with_bg/persegi panjang.webp',
  'rectangle-emboss': '/variasi_akrilik/persegi panjang timbul.webp',
};

const marketplaceProducts = [
  {
    key: 'printable-single',
    name: 'QR Tag Printable Premium - Single',
    description: 'Satu lisensi QR printable dengan file PNG dan PDF siap cetak.',
    imageUrl: '/balikin_logo.webp',
    price: PRINTABLE_SINGLE_PRICE,
    offerPath: '/produk#printable',
  },
  {
    key: 'printable-five',
    name: 'QR Tag Printable Premium - Paket 5',
    description: 'Lima lisensi QR printable dengan file PNG dan PDF siap cetak.',
    imageUrl: '/balikin_logo.webp',
    price: PRINTABLE_FIVE_PRICE,
    offerPath: '/produk#printable',
  },
  {
    key: 'printable-ten',
    name: 'QR Tag Printable Premium - Paket 10',
    description: 'Sepuluh lisensi QR printable dengan file PNG dan PDF siap cetak.',
    imageUrl: '/balikin_logo.webp',
    price: PRINTABLE_TEN_PRICE,
    offerPath: '/produk#printable',
  },
  ...stickerKeys.map((key) => ({
    key,
    name: PRODUCT_CATALOG[key].name,
    description: 'Sticker vinyl QR Balikin made-to-order dengan lisensi QR aktif.',
    imageUrl: stickerImages[key],
    price: PRODUCT_CATALOG[key].price,
    offerPath: `/produk#${key}`,
  })),
  {
    key: 'acrylic',
    name: 'Gantungan Kunci Akrilik Balikin',
    description: 'Tag akrilik QR Balikin ready-stock dalam berbagai bentuk.',
    imageUrl: acrylicImages.circle,
    price: PRODUCT_CATALOG['armor-tag'].price,
    offerPath: '/produk#akrilik',
  },
] as const;

export default async function ProductMarketplacePage() {
  const acrylicStock = await getAcrylicStock();

  return (
    <>
      <SiteGraphJsonLd
        path="/produk"
        name="Marketplace Produk Balikin"
        description="Pilih QR Tag Printable Premium, sticker QR made-to-order, atau akrilik ready-stock sesuai kebutuhan Anda."
      />
      {marketplaceProducts.map((product) => (
        <ProductJsonLd
          key={product.key}
          id={`product-schema-${product.key}`}
          productId={absoluteUrl(`/produk#product-${product.key}`)}
          name={product.name}
          description={product.description}
          imageUrl={absoluteUrl(product.imageUrl)}
          offers={[{
            name: product.name,
            price: product.price,
            url: absoluteUrl(product.offerPath),
          }]}
        />
      ))}
      <MarketingShell
        title="Pilih Produk Balikin"
        description="Pilih QR Tag Printable Premium, sticker QR made-to-order, atau akrilik ready-stock sesuai kebutuhan Anda."
      >
      <div className="not-prose space-y-12">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-xl md:px-10">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <Badge className="mb-4 bg-amber-400 text-slate-950 hover:bg-amber-400">3 pilihan media · satu sistem QR</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">Pilih bentuknya. Satu QR, tetap terhubung.</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Gunakan file printable dan cetak sendiri, pesan sticker QR made-to-order, atau pilih gantungan kunci akrilik ready-stock.
            </p>
          </div>
        </section>

        <section id="printable" className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm dark:border-amber-900/50 dark:bg-slate-900">
          <div className="grid gap-8 border-b border-amber-100 bg-amber-50/70 p-6 dark:border-amber-900/50 dark:bg-amber-950/20 md:grid-cols-[1fr_1.35fr] md:p-8">
            <div className="flex min-h-52 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <FileImage className="h-24 w-24 text-amber-500" aria-hidden="true" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-300"><FileImage className="h-6 w-6" aria-hidden="true" /><span className="font-semibold">Produk 1</span></div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">QR Tag Printable Premium</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">Tidak ingin menunggu produk fisik? Download file QR premium, tambahkan logo sendiri, lalu cetak dan tempel pada barang Anda.</p>
              <div className="mt-5 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />PNG + PDF siap cetak</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />Tanpa watermark</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />Upload logo sendiri</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />QR aktif selamanya</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3 md:p-8">
            {[
              ['Single', PRINTABLE_SINGLE_PRICE, '1 lisensi QR'],
              ['Paket 5', PRINTABLE_FIVE_PRICE, '5 lisensi QR'],
              ['Paket 10', PRINTABLE_TEN_PRICE, '10 lisensi QR'],
            ].map(([label, price, detail]) => (
              <Card key={label} className="border-amber-100 dark:border-amber-900/50">
                <CardHeader className="pb-3"><CardTitle className="text-lg dark:text-white">{label}</CardTitle><p className="text-sm text-slate-500 dark:text-slate-400">{detail}</p></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">Rp{Number(price).toLocaleString('id-ID')}</p>
                  <Button asChild className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"><Link href="/dashboard/printable"><FileImage className="mr-2 h-4 w-4" />Pilih Paket</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm dark:border-indigo-900/50 dark:bg-slate-900">
          <div className="grid gap-8 border-b border-indigo-100 bg-indigo-50/70 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20 md:grid-cols-[1fr_1.35fr] md:p-8">
            <div className="relative min-h-52 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <Image src="/sticker2.png" alt="Contoh Sticker QR Balikin" fill className="object-contain p-5" sizes="(min-width: 768px) 35vw, 90vw" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-300"><Sticker className="h-6 w-6" aria-hidden="true" /><span className="font-semibold">Produk 2</span></div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Sticker QR Balikin</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">Sticker vinyl untuk koper, laptop, helm, botol, dan barang harian. QR dicetak setelah order dikonfirmasi.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-indigo-500" />Made to order</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />Lisensi QR aktif</span>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">Pilih variant sticker</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Semua variant memiliki fungsi QR yang sama.</p></div><span className="text-sm text-slate-500">{stickerKeys.length} pilihan</span></div>
            <div className="grid gap-4 sm:grid-cols-2">
            {stickerKeys.map((key) => {
              const product = PRODUCT_CATALOG[key as ProductKey];
              return (
                <Card key={key} className="overflow-hidden border-slate-200 transition-colors hover:border-indigo-400 dark:border-slate-700">
                  <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={stickerImages[key]}
                      alt={`${product.name} - contoh produk sticker QR`}
                      fill
                      className="object-contain p-3"
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                    />
                  </div>
                  <CardHeader className="pb-3"><CardTitle className="text-lg dark:text-white">{product.name.replace('Stiker Balikin ', '')}</CardTitle><p className="text-sm text-slate-500 dark:text-slate-400">Isi {product.packSize} pcs · {getStickerProductInfo(key).size}</p></CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">Rp{product.price.toLocaleString('id-ID')}</p>
                    <Button asChild className="w-full">
                      <Link href={`/stickers#${key}`}><ShoppingCart className="mr-2 h-4 w-4" />Lihat Detail</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </section>

        <section id="akrilik" className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm dark:border-purple-900/50 dark:bg-slate-900">
          <div className="grid gap-8 border-b border-purple-100 bg-purple-50/70 p-6 dark:border-purple-900/50 dark:bg-purple-950/20 md:grid-cols-[1fr_1.35fr] md:p-8">
            <div className="relative min-h-52 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-800">
              <Image src={acrylicImages.circle} alt="Contoh gantungan kunci akrilik Balikin" fill className="object-contain p-5" sizes="(min-width: 768px) 35vw, 90vw" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 text-purple-600 dark:text-purple-300"><Package className="h-6 w-6" aria-hidden="true" /><span className="font-semibold">Produk 3</span></div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">Gantungan Kunci Akrilik</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">Tag akrilik yang lebih kokoh untuk kunci, tas, koper, dan kendaraan. Pilih bentuk yang paling sesuai dengan barang Anda.</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4 text-purple-500" />Ready stock per bentuk</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" />Stok ditampilkan dari inventaris</span>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-purple-600">Pilih variant bentuk</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stok dikurangi saat pembayaran diverifikasi.</p></div><span className="text-sm text-slate-500">{Object.values(ACRYLIC_SHAPES).length} pilihan</span></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(ACRYLIC_SHAPES).map((shape) => {
              const stock = acrylicStock.get(`acrylic-${shape.key}`) ?? 0;
              return (
                <Card key={shape.key} className="overflow-hidden border-purple-100 transition-colors hover:border-purple-400 dark:border-purple-900/50">
                  <div className="relative h-36 bg-purple-50 dark:bg-purple-950/30">
                    <Image
                      src={acrylicImages[shape.key]}
                      alt={`${shape.label} Balikin`}
                      fill
                      className="object-contain p-3"
                      sizes="(min-width: 1024px) 220px, (min-width: 640px) 40vw, 90vw"
                    />
                  </div>
                  <CardHeader className="pb-3"><CardTitle className="text-lg dark:text-white">{shape.label.replace('Akrilik ', '')}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">{shape.widthMm} × {shape.heightMm} mm · PIN per tag</p>
                    <p className="text-sm"><span className="text-slate-500 line-through">Rp{PREVIOUS_PREMIUM_PRICE.toLocaleString('id-ID')}</span> <span className="font-semibold text-slate-900 dark:text-white">Rp{PREMIUM_PRICE.toLocaleString('id-ID')}</span></p>
                    <p className={`font-semibold ${stock > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {stock > 0 ? `Stok tersedia: ${stock} pcs` : 'Stok habis'}
                    </p>
                    {stock > 0 ? (
                      <Button asChild className="w-full"><Link href={`/stickers/checkout?product=armor-tag&variant=acrylic-${shape.key}`}><ArrowRight className="mr-2 h-4 w-4" />Pilih</Link></Button>
                    ) : (
                      <Button disabled className="w-full">Stok Habis</Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 text-center dark:border-indigo-900/50 dark:bg-indigo-950/30">
          <h2 className="font-semibold text-slate-900 dark:text-white">Masih ingin merakit kombinasi sendiri?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Atur media, paket, warna, dan bentuk sesuai kebutuhan Anda.</p>
          <Button asChild variant="outline" className="mt-4"><Link href="#konfigurator">Buka Konfigurator</Link></Button>
        </section>
      </div>
      <LicenseConfiguratorSection />
      </MarketingShell>
    </>
  );
}

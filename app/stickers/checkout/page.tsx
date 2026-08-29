'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';
import { CheckoutClient } from './checkout-client';
import { PRODUCT_CATALOG, resolveProductKey, type ProductKey } from '@/lib/product-catalog';
import { normalizeStickerColorTheme } from '@/lib/sticker-color-themes';
import { SiteHeader } from '@/components/site-header';
import { FooterSection } from '@/components/landing/footer-section';

function CheckoutPageInner() {
  const searchParams = useSearchParams();

  const productKey: ProductKey = resolveProductKey(searchParams.get('product'));
  const product = PRODUCT_CATALOG[productKey];
  const stickerColorTheme = normalizeStickerColorTheme(searchParams.get('color'));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-blue-100/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-600/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/10" aria-hidden="true" />
        <div className="container relative mx-auto max-w-6xl px-4 py-8 md:py-12">
          <Link href="/stickers">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Kembali ke Produk Sticker"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Kembali ke Katalog Produk
            </Button>
          </Link>
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-700 dark:from-blue-950/60 dark:to-purple-950/60 dark:text-blue-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Checkout Sticker Vinyl
            </div>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
              Amankan Pesanan <span className="gradient-text">{product.name}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
              Isi data pengiriman dengan lengkap. Setelah order dibuat, Anda akan melihat instruksi pembayaran QRIS manual dan status order di dashboard.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <LockKeyhole className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Data pesanan Anda diproses secara aman oleh Balikin.
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <CheckoutClient productKey={productKey} stickerColorTheme={stickerColorTheme} />
      </main>

      <FooterSection />
    </div>
  );
}

export default function StickerCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />}>
      <CheckoutPageInner />
    </Suspense>
  );
}

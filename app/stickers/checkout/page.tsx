'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react';
import { CheckoutForm } from './checkout-form';
import { OrderSummary } from './order-summary';
import { PRODUCT_CATALOG, resolveProductKey, type ProductKey } from '@/lib/product-catalog';

function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productKey: ProductKey = resolveProductKey(searchParams.get('product'));
  const product = PRODUCT_CATALOG[productKey];

  const handleSuccess = (orderId: string) => {
    router.push(`/dashboard/sticker-orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/stickers">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center sm:w-auto"
              aria-label="Kembali ke Produk Sticker"
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Kembali ke Katalog Produk
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle>Checkout – {product.name}</CardTitle>
              <CardDescription>
                Isi data pengiriman Anda. Setelah order dibuat, Anda akan melihat
                instruksi pembayaran QRIS manual dan status order di dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckoutForm onSuccess={handleSuccess} productKey={productKey} />
            </CardContent>
          </Card>

          <div className="order-1 lg:order-2">
            <OrderSummary product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StickerCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CheckoutPageInner />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutForm } from './checkout-form';
import { OrderSummary } from './order-summary';
import { type ProductKey, PRODUCT_CATALOG } from '@/lib/product-catalog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardPenLine } from 'lucide-react';
import { type StickerColorTheme } from '@/lib/sticker-color-themes';

interface CheckoutClientProps {
  stickerColorTheme: StickerColorTheme;
  productKey: ProductKey;
}

export function CheckoutClient({ productKey, stickerColorTheme }: CheckoutClientProps) {
  const router = useRouter();
  const product = PRODUCT_CATALOG[productKey];
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingCourier, setShippingCourier] = useState<string>('');
  const [destinationCityId, setDestinationCityId] = useState<string>('');
  const [destinationCityName, setDestinationCityName] = useState<string>('');

  const handleShippingCostChange = (
    cost: number,
    courier: string,
    cityId: string,
    cityName: string
  ) => {
    setShippingCost(cost);
    setShippingCourier(courier);
    setDestinationCityId(cityId);
    setDestinationCityName(cityName);
  };

  const handleSuccess = (orderId: string) => {
    router.push(`/dashboard/sticker-orders/${orderId}`);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
      <Card className="order-2 border-2 border-blue-100/80 bg-white/90 shadow-xl shadow-blue-900/5 dark:border-slate-700 dark:bg-slate-900/90 lg:order-1">
        <CardHeader className="border-b border-slate-100 pb-5 dark:border-slate-800">
          <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white md:text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
              <ClipboardPenLine className="h-5 w-5" aria-hidden="true" />
            </span>
            Data Pengiriman
          </CardTitle>
          <CardDescription className="pt-1 text-slate-500 dark:text-slate-400">
            Lengkapi informasi berikut agar pesanan sticker dapat dikirim ke alamat Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <CheckoutForm
            stickerColorTheme={stickerColorTheme}
            productKey={productKey}
            onShippingCostChange={handleShippingCostChange}
            shippingCost={shippingCost}
            shippingCourier={shippingCourier}
            destinationCityId={destinationCityId}
            destinationCityName={destinationCityName}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
      <div className="order-1 lg:order-2 lg:sticky lg:top-24">
        <OrderSummary product={product} stickerColorTheme={stickerColorTheme} shippingCost={shippingCost} />
      </div>
    </div>
  );
}

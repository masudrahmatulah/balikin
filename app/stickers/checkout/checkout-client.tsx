'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutForm } from './checkout-form';
import { OrderSummary } from './order-summary';
import { type ProductKey, PRODUCT_CATALOG } from '@/lib/product-catalog';

interface CheckoutClientProps {
  productKey: ProductKey;
}

export function CheckoutClient({ productKey }: CheckoutClientProps) {
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
    <>
      <CheckoutForm
        productKey={productKey}
        onShippingCostChange={handleShippingCostChange}
        shippingCost={shippingCost}
        shippingCourier={shippingCourier}
        destinationCityId={destinationCityId}
        destinationCityName={destinationCityName}
        onSuccess={handleSuccess}
      />
      <div className="order-1 lg:order-2">
        <OrderSummary product={product} shippingCost={shippingCost} />
      </div>
    </>
  );
}

'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface InitiatePaymentInput {
  orderId: string;
}

export async function initiatePayment(input: InitiatePaymentInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/payment/create-snap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: input.orderId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment');
    }

    const data = await response.json();
    return {
      success: true,
      token: data.data.token,
      redirectUrl: data.data.redirectUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat pembayaran';
    throw new Error(message);
  }
}

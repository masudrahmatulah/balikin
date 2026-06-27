import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MIDTRANS_BASE_URL, MIDTRANS_ENV } from '@/lib/constants';

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

if (!SERVER_KEY) {
  throw new Error('MIDTRANS_SERVER_KEY is not defined in environment variables');
}

interface CreateSnapRequest {
  orderId: string;
}

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateSnapRequest;
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch order from database
    const order = await db
      .select()
      .from(stickerOrders)
      .where(eq(stickerOrders.id, orderId))
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const sticker = order[0];

    // Verify order belongs to user
    if (sticker.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: order does not belong to user' },
        { status: 403 }
      );
    }

    // Create Midtrans Snap transaction
    const midtransPayload = {
      transaction_details: {
        order_id: sticker.id,
        gross_amount: sticker.totalAmount,
      },
      customer_details: {
        first_name: sticker.recipientName,
        phone: sticker.phone,
      },
      enabled_payments: ['qris'], // QRIS only
      item_details: [
        {
          id: 'sticker-pack',
          price: sticker.totalAmount - sticker.shippingCost,
          quantity: 1,
          name: `Sticker Pack (${sticker.unitCountPerPack} units)`,
        },
        {
          id: 'shipping',
          price: sticker.shippingCost,
          quantity: 1,
          name: `Shipping (${sticker.shippingCourier.toUpperCase()})`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${sticker.id}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${sticker.id}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/sticker-orders/${sticker.id}`,
      },
      custom_field1: sticker.id,
    };

    // Base64 encode credentials
    const auth = Buffer.from(`${SERVER_KEY}:`).toString('base64');

    const snapResponse = await fetch(`${MIDTRANS_BASE_URL}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!snapResponse.ok) {
      const errorData = await snapResponse.json();
      console.error('Midtrans Snap error:', errorData);
      throw new Error('Failed to create Midtrans transaction');
    }

    const snapData = (await snapResponse.json()) as MidtransSnapResponse;

    return NextResponse.json({
      success: true,
      data: {
        token: snapData.token,
        redirectUrl: snapData.redirect_url,
      },
    });
  } catch (error) {
    console.error('Error creating Midtrans payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

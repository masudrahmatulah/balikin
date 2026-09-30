import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stickerOrders, tagUpgradeOrders, tags } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifyKomerceCallback } from '@/lib/komerce-payment';

function resolvePaymentStatus(raw: string): 'pending' | 'paid' | 'failed' {
  const status = raw.toUpperCase();
  if (['PAID', 'SUCCESS', 'SETTLEMENT', 'CAPTURE', 'COMPLETED'].includes(status)) return 'paid';
  if (['PENDING', 'PROCESSING', 'UNPAID', 'WAITING'].includes(status)) return 'pending';
  return 'failed';
}

type CallbackPayload = Record<string, unknown>;

function getCallbackField(payload: CallbackPayload, keys: string[]): unknown {
  for (const key of keys) {
    if (key in payload) return payload[key];
  }

  const nested = payload.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const key of keys) {
      if (key in nested) return (nested as CallbackPayload)[key];
    }
  }

  return undefined;
}

function normalizeProvider(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function validateCallbackBinding(payload: CallbackPayload, expectedAmount: number): string | null {
  const amount = getCallbackField(payload, [
    'amount',
    'paid_amount',
    'transaction_amount',
    'gross_amount',
    'total_amount',
  ]);
  if (amount !== undefined) {
    const parsedAmount = typeof amount === 'number'
      ? amount
      : typeof amount === 'string' && amount.trim() !== ''
        ? Number(amount)
        : NaN;
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount !== expectedAmount) {
      return 'Callback amount does not match the order';
    }
  }

  const currency = getCallbackField(payload, ['currency', 'currency_code']);
  if (currency !== undefined && (typeof currency !== 'string' || currency.toUpperCase() !== 'IDR')) {
    return 'Callback currency does not match the order';
  }

  const paymentType = getCallbackField(payload, ['payment_type', 'payment_method', 'channel_code']);
  if (paymentType !== undefined && (
    typeof paymentType !== 'string' ||
    !['qris', 'manualqris'].includes(normalizeProvider(paymentType))
  )) {
    return 'Callback payment method does not match the order';
  }

  // The current schema has no provider column. The signed callback secret is
  // the provider binding; reject an explicit payload provider that is not Komerce.
  const provider = getCallbackField(payload, [
    'provider',
    'provider_name',
    'payment_provider',
    'gateway',
  ]);
  if (provider !== undefined && (
    typeof provider !== 'string' ||
    !['komerce', 'komercepayment', 'komercepay'].includes(normalizeProvider(provider))
  )) {
    return 'Callback provider does not match the payment provider';
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-callback-api-key') || '';

    if (!verifyKomerceCallback(rawBody, signature)) {
      console.error('Invalid Komerce callback signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const payload = JSON.parse(rawBody) as CallbackPayload;
    const orderIdValue = getCallbackField(payload, ['order_id', 'orderId']);
    const orderId = typeof orderIdValue === 'string' ? orderIdValue : String(orderIdValue ?? '');
    const statusValue = getCallbackField(payload, ['payment_status', 'status', 'transaction_status']);
    const paymentStatus = resolvePaymentStatus(
      typeof statusValue === 'string' ? statusValue : String(statusValue ?? '')
    );

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'order_id missing' },
        { status: 400 }
      );
    }

    // Tag upgrade (free -> premium) orders use an "upg_" prefixed order_id
    if (orderId.startsWith('upg_')) {
      const upgradeOrderId = orderId.slice('upg_'.length);

      const upgradeResult = await db.transaction(async (tx) => {
        const [upgradeOrder] = await tx
          .select()
          .from(tagUpgradeOrders)
          .where(and(
            eq(tagUpgradeOrders.id, upgradeOrderId),
            eq(tagUpgradeOrders.app_id, 'balikin_id'),
          ))
          .for('update');

        if (!upgradeOrder) return null;

        const bindingError = validateCallbackBinding(payload, upgradeOrder.amount);
        if (bindingError) return { invalid: bindingError };

        // Paid is terminal for webhook updates. A retry must not downgrade it.
        const nextStatus = upgradeOrder.paymentStatus === 'paid'
          ? 'paid'
          : upgradeOrder.paymentStatus === 'failed' && paymentStatus !== 'paid'
            ? 'failed'
            : paymentStatus;
        const newlyPaid = upgradeOrder.paymentStatus !== 'paid' && nextStatus === 'paid';

        if (nextStatus !== upgradeOrder.paymentStatus) {
          await tx
            .update(tagUpgradeOrders)
            .set({ paymentStatus: nextStatus, updatedAt: new Date() })
            .where(and(
              eq(tagUpgradeOrders.id, upgradeOrderId),
              eq(tagUpgradeOrders.app_id, 'balikin_id'),
              eq(tagUpgradeOrders.paymentStatus, upgradeOrder.paymentStatus),
            ));
        }

        if (nextStatus === 'paid') {
          await tx
            .update(tags)
            .set({ tier: 'premium', productType: 'acrylic', expiresAt: null })
            .where(and(eq(tags.id, upgradeOrder.tagId), eq(tags.app_id, 'balikin_id')));
        }

        return { paymentStatus: nextStatus, newlyPaid };
      });

      if (!upgradeResult) {
        console.error(`Tag upgrade order not found: ${upgradeOrderId}`);
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      if ('invalid' in upgradeResult) {
        return NextResponse.json(
          { success: false, error: upgradeResult.invalid },
          { status: 400 },
        );
      }

      if (upgradeResult.newlyPaid) {
        revalidatePath('/dashboard');
        revalidatePath('/p/[slug]');
        revalidateTag('tags', 'max');
      }

      console.log(`Komerce payment ${paymentStatus} for tag upgrade order: ${upgradeOrderId}`);

      return NextResponse.json({
        success: true,
        data: { orderId: upgradeOrderId, paymentStatus: upgradeResult.paymentStatus },
      });
    }

    // Sticker order payment
    const stickerResult = await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(stickerOrders)
        .where(and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, 'balikin_id')))
        .for('update');

      if (!order) return null;

      if (order.paymentMethod !== 'manual_qris') {
        return { invalid: 'Order is not bound to a Komerce QRIS payment' };
      }

      const bindingError = validateCallbackBinding(payload, order.totalAmount);
      if (bindingError) return { invalid: bindingError };

      // Keep paid orders paid and keep their fulfillment progress on retries.
      const nextPaymentStatus = order.paymentStatus === 'paid'
        ? 'paid'
        : order.paymentStatus === 'failed' && paymentStatus !== 'paid'
          ? 'failed'
          : paymentStatus;
      const newlyPaid = order.paymentStatus !== 'paid' && nextPaymentStatus === 'paid';

      if (nextPaymentStatus !== order.paymentStatus || newlyPaid) {
        await tx
          .update(stickerOrders)
          .set({
            paymentStatus: nextPaymentStatus,
            ...(newlyPaid ? { status: 'pending_fulfillment' } : {}),
            updatedAt: new Date(),
          })
          .where(and(
            eq(stickerOrders.id, orderId),
            eq(stickerOrders.app_id, 'balikin_id'),
            eq(stickerOrders.paymentStatus, order.paymentStatus),
          ));
      }

      return { paymentStatus: nextPaymentStatus, newlyPaid };
    });

    if (!stickerResult) {
      console.error(`Sticker order not found: ${orderId}`);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if ('invalid' in stickerResult) {
      return NextResponse.json(
        { success: false, error: stickerResult.invalid },
        { status: 400 },
      );
    }

    if (stickerResult.newlyPaid) {
      revalidatePath('/dashboard');
    }

    console.log(`Komerce payment ${paymentStatus} for order: ${orderId}`);

    return NextResponse.json({
      success: true,
      data: { orderId, paymentStatus: stickerResult.paymentStatus },
    });
  } catch (error) {
    console.error('Error processing Komerce webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

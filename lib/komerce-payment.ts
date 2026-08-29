import { createHmac } from 'crypto';
import {
  KOMERCE_PAYMENT_BASE_URL,
  KOMERCE_PAYMENT_CALLBACK_SECRET,
  KOMERCE_PAYMENT_PAGE_URL,
} from '@/lib/constants';

export type KomercePaymentType = 'qris' | 'bank_transfer';

export interface KomerceCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface KomerceItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateKomercePaymentInput {
  orderId: string;
  amount: number;
  customer: KomerceCustomer;
  items: KomerceItem[];
  paymentType?: KomercePaymentType;
  channelCode?: string;
  expiryDuration?: number;
  callbackUrl?: string;
}

export interface KomercePaymentData {
  payment_id?: string;
  id?: string;
  token?: string;
  payment_token?: string;
  payment_url?: string;
  qr_string?: string;
  va_number?: string;
  amount?: number;
  expires_at?: string;
}

interface KomerceResponseBody<T = KomercePaymentData> {
  meta?: { code?: number; status?: string; message?: string };
  data?: T | null;
}

export function getKomerceApiKey(): string {
  const apiKey = process.env.KOMERCE_PAYMENT_API_KEY || process.env.RAJAONGKIR_API_KEY;
  if (!apiKey) {
    throw new Error('KOMERCE_PAYMENT_API_KEY belum dikonfigurasi');
  }
  return apiKey;
}

export async function createKomercePayment(input: CreateKomercePaymentInput): Promise<KomercePaymentData> {
  const apiKey = getKomerceApiKey();

  const payload: Record<string, unknown> = {
    order_id: input.orderId,
    payment_type: input.paymentType ?? 'qris',
    amount: input.amount,
    customer: input.customer,
    items: input.items,
  };

  if (input.channelCode) payload.channel_code = input.channelCode;
  if (input.expiryDuration) payload.expiry_duration = input.expiryDuration;
  if (input.callbackUrl) {
    payload.callback_url = input.callbackUrl;
    payload.callback_api_key = KOMERCE_PAYMENT_CALLBACK_SECRET;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${KOMERCE_PAYMENT_BASE_URL}/api/v1/user/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as KomerceResponseBody | null;

    if (!response.ok || !body || body.meta?.status !== 'success') {
      console.error('Komerce payment create error:', body);
      throw new Error(body?.meta?.message || 'Gagal membuat transaksi pembayaran');
    }

    return body.data ?? {};
  } finally {
    clearTimeout(timeout);
  }
}

export function buildKomercePaymentResult(data: KomercePaymentData) {
  const token = data.token || data.payment_token;
  const paymentUrl = data.payment_url || (token ? `${KOMERCE_PAYMENT_PAGE_URL}/${token}` : null);

  return {
    paymentId: data.payment_id || data.id || null,
    paymentUrl,
    qrString: data.qr_string || null,
    vaNumber: data.va_number || null,
    amount: data.amount ?? null,
  };
}

export function verifyKomerceCallback(rawBody: string, signature: string): boolean {
  if (!KOMERCE_PAYMENT_CALLBACK_SECRET || !signature) return false;
  const expected = createHmac('sha256', KOMERCE_PAYMENT_CALLBACK_SECRET).update(rawBody).digest('hex');
  return expected === signature;
}
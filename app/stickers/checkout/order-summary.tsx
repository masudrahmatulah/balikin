import { CreditCard, Sticker } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_LABEL,
  STICKER_QRIS_NOTES,
} from '@/lib/constants';

export function OrderSummary() {
  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle>Ringkasan Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Produk</span>
            <span className="font-medium">Sticker Vinyl Pack</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Isi Pack</span>
            <span className="font-medium">
              {STICKER_PACK_SIZE} sticker
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold text-slate-950">
              Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" aria-hidden="true" />
            Pembayaran Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            Metode awal yang dipakai untuk MVP ini adalah{' '}
            <span className="font-medium text-slate-900">
              {STICKER_PAYMENT_LABEL}
            </span>
            .
          </p>
          <p>{STICKER_QRIS_NOTES}</p>
          <p>
            Setelah order tersimpan, Anda akan diarahkan ke halaman status order
            untuk melihat instruksi bayar dan progres verifikasi admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
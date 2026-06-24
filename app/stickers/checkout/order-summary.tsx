import { QrCode, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STICKER_PAYMENT_LABEL, STICKER_QRIS_NOTES } from '@/lib/constants';
import { type PRODUCT_CATALOG } from '@/lib/product-catalog';

type ProductEntry = (typeof PRODUCT_CATALOG)[keyof typeof PRODUCT_CATALOG];

interface OrderSummaryProps {
  product: ProductEntry;
}

export function OrderSummary({ product }: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Ringkasan produk */}
      <Card className="border-emerald-200 bg-emerald-50/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            Ringkasan Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex justify-between gap-4">
            <span>Produk</span>
            <span className="font-medium text-right">{product.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Isi Pack</span>
            <span className="font-medium">{product.packSize} unit</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Material</span>
            <span className="font-medium">
              {product.productType === 'acrylic' ? 'Akrilik Premium' : 'Vinyl Premium (UV Protected)'}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
            <span>Harga Produk</span>
            <span className="font-medium">Rp{product.price.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-500 text-xs">
            <span>Ongkir</span>
            <span>Dihitung setelah konfirmasi alamat</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
            <span className="font-semibold">Total Produk</span>
            <span className="text-lg font-bold text-slate-950">
              Rp{product.price.toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metode pembayaran */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Pembayaran {STICKER_PAYMENT_LABEL}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>{STICKER_QRIS_NOTES}</p>
          <p className="text-xs text-slate-500">
            Setelah order tersimpan, Anda akan diarahkan ke halaman status order
            untuk melihat QR pembayaran dan progres verifikasi admin.
          </p>
        </CardContent>
      </Card>

      {/* Benefit premium */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="pt-4 space-y-1 text-xs text-blue-800">
          <p className="font-semibold mb-2">Yang Anda dapatkan:</p>
          <p>✓ WhatsApp Gateway gratis 1 tahun</p>
          <p>✓ GPS Tracking presisi</p>
          <p>✓ Lost Mode emergency display</p>
          <p>✓ Anonymous contact (nomor WA tersembunyi)</p>
          <p>✓ Verified Owner Badge</p>
        </CardContent>
      </Card>
    </div>
  );
}

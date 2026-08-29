import { QrCode, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STICKER_PAYMENT_LABEL, STICKER_QRIS_NOTES } from '@/lib/constants';
import { type PRODUCT_CATALOG } from '@/lib/product-catalog';
import { STICKER_COLOR_THEMES, type StickerColorTheme } from '@/lib/sticker-color-themes';

type ProductEntry = (typeof PRODUCT_CATALOG)[keyof typeof PRODUCT_CATALOG];

interface OrderSummaryProps {
  stickerColorTheme?: StickerColorTheme;
  product: ProductEntry;
  shippingCost?: number | null;
}

export function OrderSummary({ product, stickerColorTheme, shippingCost }: OrderSummaryProps) {
  const grandTotal = shippingCost !== null && shippingCost !== undefined
    ? product.price + shippingCost
    : product.price;

  return (
    <div className="space-y-4">
      {/* Ringkasan produk */}
      <Card className="border-2 border-indigo-100 bg-white/90 shadow-lg shadow-indigo-900/5 dark:border-slate-700 dark:bg-slate-900/90">
        <CardHeader className="border-b border-indigo-100/80 pb-4 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </span>
            Ringkasan Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-5 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex justify-between gap-4">
            <span>Produk</span>
            <span className="text-right font-medium text-slate-900 dark:text-white">{product.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Isi Pack</span>
            <span className="font-medium text-slate-900 dark:text-white">{product.packSize} unit</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Material</span>
            <span className="text-right font-medium text-slate-900 dark:text-white">
              {product.productType === 'acrylic' ? 'Akrilik Premium' : 'Vinyl Premium (UV Protected)'}
            </span>
          </div>
          {product.productType === 'sticker' && stickerColorTheme && (
            <div className="flex items-center justify-between gap-4">
              <span>Warna Sticker</span>
              <span className="flex items-center gap-2 text-right font-medium text-slate-900 dark:text-white">
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ background: `linear-gradient(135deg, ${STICKER_COLOR_THEMES[stickerColorTheme].background} 55%, ${STICKER_COLOR_THEMES[stickerColorTheme].accent} 55%)` }}
                  aria-hidden="true"
                />
                {STICKER_COLOR_THEMES[stickerColorTheme].label}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 dark:border-slate-700">
            <span>Harga Produk</span>
            <span className="font-medium text-slate-900 dark:text-white">Rp{product.price.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>Ongkir</span>
            {shippingCost === null || shippingCost === undefined ? (
              <span className="text-right text-xs">Pilih kota &amp; kurir</span>
            ) : (
              <span className="font-medium text-slate-900 dark:text-white">Rp{shippingCost.toLocaleString('id-ID')}</span>
            )}
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">Grand Total</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Rp{grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metode pembayaran */}
      <Card className="border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white">
            <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
            Pembayaran {STICKER_PAYMENT_LABEL}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 text-sm text-slate-600 dark:text-slate-300">
          <p>{STICKER_QRIS_NOTES}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Setelah order tersimpan, Anda akan diarahkan ke halaman status order
            untuk melihat QR pembayaran dan progres verifikasi admin.
          </p>
        </CardContent>
      </Card>

      {/* Benefit premium */}
      <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 dark:border-slate-700 dark:from-blue-950/40 dark:to-purple-950/40">
        <CardContent className="space-y-1 pt-4 text-xs text-blue-800 dark:text-blue-200">
          <p className="mb-2 font-semibold">Yang Anda dapatkan:</p>
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

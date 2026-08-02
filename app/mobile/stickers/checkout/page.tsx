'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, CreditCard } from 'lucide-react';
import { useState, useTransition, Suspense } from 'react';
import { createStickerOrder } from '@/app/stickers/checkout/actions';
import { PRODUCT_CATALOG, resolveProductKey } from '@/lib/product-catalog';

function MobileCheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [segment, setSegment] = useState('');
  const [isPending, startTransition] = useTransition();

  const productKey = resolveProductKey(searchParams.get('product'));
  const product = PRODUCT_CATALOG[productKey];

  const handleSubmit = async (formData: FormData) => {
    if (!segment) {
      setErrors({ segment: 'Pilih tujuan penggunaan produk' });
      return;
    }

    const input = {
      recipientName: String(formData.get('recipientName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      addressLine: String(formData.get('addressLine') ?? ''),
      city: String(formData.get('city') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      segment,
      productKey,
    };

    setErrors({});
    startTransition(async () => {
      try {
        const order = await createStickerOrder(input);
        router.push(`/mobile/sticker-orders/${order.id}`);
      } catch (error) {
        setErrors({
          form: error instanceof Error ? error.message : 'Terjadi kesalahan',
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile/stickers">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-600">Isi data pengiriman Anda</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500">Isi {product.packSize} unit</p>
            </div>
            <p className="text-lg font-bold text-mobile-primary">
              Rp{product.price.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp{product.price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkir</span>
              <span className="text-xs text-right">Dihitung setelah konfirmasi</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Produk</span>
              <span>Rp{product.price.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form action={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 text-sm text-mobile-danger bg-mobile-danger-lighter rounded-xl" role="alert">
              {errors.form}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-4">
            <h3 className="font-bold text-gray-900">Data Pengiriman</h3>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                required
                placeholder="Contoh: Budi Santoso"
                maxLength={100}
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="628123456789"
                maxLength={20}
                inputMode="tel"
                autoComplete="tel"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">Format: 628xxxxxxxxxx (tanpa + atau 0 di depan)</p>
            </div>

            <div>
              <label htmlFor="segment" className="block text-sm font-medium text-gray-700 mb-1">
                Produk ini untuk kepentingan? <span className="text-red-500">*</span>
              </label>
              <select
                id="segment"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none bg-white"
              >
                <option value="">Pilih tujuan penggunaan</option>
                <option value="pribadi">Pribadi</option>
                <option value="keluarga">Keluarga</option>
                <option value="bisnis">Bisnis / Komersial</option>
              </select>
              {errors.segment && (
                <p className="mt-1 text-xs text-mobile-danger" role="alert">{errors.segment}</p>
              )}
            </div>

            <div>
              <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                id="addressLine"
                name="addressLine"
                required
                rows={3}
                placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan"
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Kota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="Makassar"
                  maxLength={100}
                  autoComplete="address-level2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  placeholder="90111"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="voucherCode" className="block text-sm font-medium text-gray-700 mb-1">
                Kode Voucher (Opsional)
              </label>
              <input
                type="text"
                id="voucherCode"
                name="voucherCode"
                placeholder="Contoh: BALIKIN10"
                maxLength={50}
                autoComplete="off"
                style={{ textTransform: 'uppercase' }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Contoh: kirim sore hari, warna helm, atau kebutuhan khusus lainnya"
                maxLength={300}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none resize-none"
              />
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-mobile-info-lighter border border-mobile-info-lighter rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-mobile-info flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-mobile-info">Pembayaran QRIS</p>
                <p className="text-xs text-mobile-info mt-1">
                  Setelah order dibuat, Anda akan melihat instruksi pembayaran QRIS manual di halaman detail order.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-mobile-primary text-white py-4 rounded-xl font-semibold shadow-lg shadow-mobile-primary/30 disabled:opacity-50 btn-press"
          >
            {isPending ? 'Memproses...' : 'Lanjutkan ke Instruksi Pembayaran'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Setelah order dibuat, admin akan memverifikasi pembayaran dan mengirim ke alamat Anda.
          </p>
        </form>

        <div className="h-8" />
      </main>
    </div>
  );
}

export default function MobileStickersCheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to" />}>
      <MobileCheckoutInner />
    </Suspense>
  );
}

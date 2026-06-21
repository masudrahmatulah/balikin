'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, CreditCard } from 'lucide-react';
import { useState, useTransition } from 'react';
import { createStickerOrder } from '@/app/stickers/checkout/actions';

export default function MobileStickersCheckoutPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const input = {
      recipientName: String(formData.get('recipientName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      addressLine: String(formData.get('addressLine') ?? ''),
      city: String(formData.get('city') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      notes: String(formData.get('notes') ?? ''),
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
          <h1 className="text-xl font-bold text-gray-900">Checkout Sticker Vinyl</h1>
          <p className="text-sm text-gray-600">Isi data pengiriman Anda</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">Sticker Vinyl Pack</h2>
              <p className="text-sm text-gray-500">Isi 6 stiker</p>
            </div>
            <p className="text-lg font-bold text-mobile-primary">Rp35.000</p>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>Rp35.000</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Admin</span>
              <span>Gratis</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>Rp35.000</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form action={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 text-sm text-mobile-danger bg-mobile-danger-lighter rounded-xl">
              {errors.form}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-4">
            <h3 className="font-bold text-gray-900 mb-2">Data Pengiriman</h3>

            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Penerima *
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                required
                placeholder="Contoh: Budi Santoso"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="628123456789"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
              />
            </div>

            <div>
              <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap *
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
                  Kota *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  placeholder="Makassar"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  placeholder="90111"
                  maxLength={10}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan
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
            {isPending ? 'Memproses...' : 'Buat Order'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Setelah order dibuat, admin akan memverifikasi pembayaran dan mengirim sticker ke alamat Anda.
          </p>
        </form>

        <div className="h-8" />
      </main>
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, ReceiptText, Sticker, MessageCircle } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  WHATSAPP_ORDER_NUMBER,
} from '@/lib/constants';

export default async function MobileStickerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { orderId } = await params;
  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, orderId),
    with: {
      bundles: {
        with: {
          tags: true,
        },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(`Halo, saya ingin konfirmasi pembayaran order sticker ${order.id}.`)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile/profile/tags">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Order Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-xl flex items-center justify-center">
              <Sticker className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Order Sticker Vinyl</h1>
              <p className="text-xs text-gray-500">Order ID: {order.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.paymentStatus === 'paid'
                ? 'bg-mobile-success-lighter text-mobile-success'
                : 'bg-mobile-warning-lighter text-mobile-warning'
            }`}>
              {order.paymentStatus === 'paid' ? 'Terverifikasi' : 'Menunggu Bayar'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-mobile-info-lighter text-mobile-info">
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Detail Order</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Produk</span>
              <span className="font-medium text-gray-900">Sticker Vinyl Pack isi {STICKER_PACK_SIZE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-mobile-primary">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Penerima</span>
              <span className="font-medium text-gray-900">{order.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">WhatsApp</span>
              <span className="font-medium text-gray-900">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Alamat</span>
              <span className="font-medium text-gray-900 text-right">{order.addressLine}, {order.city}</span>
            </div>
            {order.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block mb-1">Catatan</span>
                <span className="text-gray-900">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions */}
        {order.paymentStatus !== 'paid' && (
          <div className="bg-mobile-warning-lighter border border-mobile-warning-lighter rounded-2xl p-5">
            <h3 className="text-sm font-bold text-mobile-warning mb-2">Instruksi Pembayaran</h3>
            <p className="text-xs text-mobile-warning mb-4">
              Lakukan pembayaran sesuai nominal order lalu kirim konfirmasi ke admin Balikin.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-mobile-success text-white py-3 rounded-xl text-center font-semibold btn-press"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Konfirmasi via WhatsApp
              </div>
            </a>
          </div>
        )}

        {/* Bundle Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-mobile-primary" />
            Bundle Aktivasi
          </h2>

          {order.bundles.length === 0 ? (
            <p className="text-sm text-gray-600">
              Bundle sticker belum dibuat. Setelah pembayaran diverifikasi admin, 6 tag unclaimed akan muncul di sini.
            </p>
          ) : (
            <div className="space-y-3">
              {order.bundles.map((bundle) => (
                <div key={bundle.id} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">Bundle {bundle.id}</p>
                  <p className="text-xs text-gray-500 mt-1">Status: {bundle.status}</p>
                  <div className="mt-3 grid gap-2 grid-cols-2">
                    {bundle.tags.map((tag) => (
                      <div key={tag.id} className="bg-white rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{tag.name}</p>
                        <p className="text-xs text-gray-500 font-mono">/p/{tag.slug}</p>
                        <p className="text-xs mt-1">
                          {tag.ownerId ? (
                            <span className="text-mobile-success">Aktif</span>
                          ) : (
                            <span className="text-mobile-warning">Belum aktif</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

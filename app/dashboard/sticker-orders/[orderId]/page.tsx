import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, ReceiptText, Sticker } from 'lucide-react';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import {
  STICKER_PACK_PRICE,
  STICKER_PACK_SIZE,
  STICKER_PAYMENT_LABEL,
  WHATSAPP_ORDER_NUMBER,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StickerOrderDetailPage({
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-center sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sticker className="h-5 w-5 text-emerald-600" />
                  Order Sticker Vinyl
                </CardTitle>
                <CardDescription>Order ID: {order.id}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                  {order.paymentStatus === 'paid' ? 'Pembayaran Terverifikasi' : 'Menunggu Pembayaran'}
                </Badge>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm text-slate-600">
              <p><span className="font-medium text-slate-900">Produk:</span> Sticker Vinyl Pack isi {STICKER_PACK_SIZE}</p>
              <p><span className="font-medium text-slate-900">Metode Bayar:</span> {STICKER_PAYMENT_LABEL}</p>
              <p><span className="font-medium text-slate-900">Total:</span> Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</p>
              <p><span className="font-medium text-slate-900">Penerima:</span> {order.recipientName}</p>
              <p><span className="font-medium text-slate-900">WhatsApp:</span> {order.phone}</p>
              <p><span className="font-medium text-slate-900">Alamat:</span> {order.addressLine}, {order.city}, {order.postalCode}</p>
              {order.notes && <p><span className="font-medium text-slate-900">Catatan:</span> {order.notes}</p>}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-950">Instruksi Pembayaran QRIS</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Lakukan pembayaran sesuai nominal order lalu kirim konfirmasi ke admin Balikin. Setelah diverifikasi, admin akan menyiapkan 1 bundle berisi 6 QR sticker unik untuk order ini.
              </p>
              <div className="mt-4">
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    Konfirmasi via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Bundle Aktivasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.bundles.length === 0 ? (
              <p className="text-sm text-slate-600">
                Bundle sticker belum dibuat. Setelah pembayaran diverifikasi admin, 6 tag unclaimed akan muncul di sini dan siap diaktivasi satu per satu saat sticker dipasang.
              </p>
            ) : (
              <div className="space-y-4">
                {order.bundles.map((bundle) => (
                  <div key={bundle.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Bundle {bundle.id}</p>
                    <p className="mt-1 text-sm text-slate-600">Status: {bundle.status}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {bundle.tags.map((tag) => (
                        <div key={tag.id} className="rounded-xl border border-white bg-white p-3 text-sm text-slate-600">
                          <p className="font-medium text-slate-900">{tag.name}</p>
                          <p className="break-all font-mono text-xs text-slate-500">/p/{tag.slug}</p>
                          <p className="mt-1">{tag.ownerId ? 'Sudah aktif' : 'Belum diaktivasi'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-slate-700" />
              Status Order MVP
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Status yang dipakai saat ini: `pending_payment`, `paid`, `in_production`, `shipped`, dan `completed`.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

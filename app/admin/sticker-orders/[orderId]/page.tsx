import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { AdminHeader } from '@/components/admin/admin-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintBundleButton } from '@/components/admin/print-bundle-button';
import { getShapeLabel, getSizeLabel } from '@/lib/sticker-template';

export default async function AdminStickerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-orders');
  }

  const { orderId } = await params;
  const order = await db.query.stickerOrders.findFirst({
    where: eq(stickerOrders.id, orderId),
    with: {
      user: true,
      bundles: {
        with: {
          tags: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const bundlesWithQr = await Promise.all(order.bundles.map(async (bundle) => ({
    ...bundle,
    tags: await Promise.all(bundle.tags.map(async (tag) => ({
      ...tag,
      qrDataUrl: await QRCode.toDataURL(`${baseUrl}/p/${tag.slug}`, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'H',
      }),
    }))),
  })));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Detail Bundle Sticker</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Order {order.id}</p>
          </div>
          <Link href="/admin/sticker-orders">
            <Button variant="outline">Kembali ke Sticker Orders</Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ringkasan Order</CardTitle>
            <CardDescription>{order.recipientName} • {order.phone} • {order.user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="outline">{order.paymentStatus}</Badge>
            <Badge variant="outline">{order.status}</Badge>
            <Badge variant="outline">{order.city}</Badge>
          </CardContent>
        </Card>

        {order.bundles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-600">
              Bundle belum dibuat untuk order ini.
            </CardContent>
          </Card>
        ) : (
          bundlesWithQr.map((bundle, bundleIndex) => (
            <Card key={bundle.id} className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Bundle {bundle.id.slice(0, 8)}...</CardTitle>
                    <CardDescription>
                      {bundle.itemCount} sticker • {getShapeLabel(bundle.stickerShape as any)} • {getSizeLabel(bundle.stickerSize as any)} • {bundle.status}
                    </CardDescription>
                  </div>
                  <PrintBundleButton
                    bundleId={bundle.id}
                    bundleIndex={bundleIndex + 1}
                    stickerShape={bundle.stickerShape as any}
                    stickerSize={bundle.stickerSize as any}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {bundle.tags.map((tag) => (
                    <div key={tag.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex justify-center rounded-xl border bg-white p-4">
                        <img src={tag.qrDataUrl} alt={`QR ${tag.slug}`} className="h-48 w-48" />
                      </div>
                      <p className="mt-3 font-medium text-slate-900">{tag.name}</p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-500">/p/{tag.slug}</p>
                      <p className="mt-2 text-sm text-slate-600">{tag.ownerId ? 'Sudah diaktivasi' : 'Belum diaktivasi'}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`/p/${tag.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Buka Halaman Publik
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}

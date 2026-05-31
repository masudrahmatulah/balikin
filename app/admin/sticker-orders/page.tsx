import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import {
  getStickerOrders,
  getStickerOrdersCount,
  getPendingOrdersCount,
} from './data-access';
import { AdminHeader } from '@/components/admin/admin-header';
import { GenerateBundleButton } from '@/components/admin/generate-bundle-button';
import { verifyStickerOrder, updateStickerOrderStatus } from './actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminStickerOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-orders');
  }

  const page = Number(searchParams.page) || 1;
  const [orders, totalCount, pendingCount] = await Promise.all([
    getStickerOrders(page),
    getStickerOrdersCount(),
    getPendingOrdersCount(),
  ]);

  const totalPages = Math.ceil(totalCount / 20);
  const ORDERS_PER_PAGE = 20;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <AdminHeader session={session} pendingOrdersCount={pendingCount} />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sticker Orders
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verifikasi pembayaran dan generate bundle sticker pack.
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Kembali ke Admin</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-gray-600">
                Belum ada order sticker.
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.id}</CardTitle>
                      <CardDescription>
                        {order.recipientName} • {order.city} •{' '}
                        {order.user?.email}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{order.paymentStatus}</Badge>
                      <Badge variant="outline">{order.status}</Badge>
                      <Badge variant="outline">
                        bundle {order.bundles.length}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      WhatsApp:{' '}
                      <span className="font-medium text-gray-900">
                        {order.phone}
                      </span>
                    </div>
                    <div>
                      Total:{' '}
                      <span className="font-medium text-gray-900">
                        Rp{order.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div>
                      Pack:{' '}
                      <span className="font-medium text-gray-900">
                        {order.packQuantity} x {order.unitCountPerPack}
                      </span>
                    </div>
                    <div>
                      Alamat:{' '}
                      <span className="font-medium text-gray-900">
                        {order.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.paymentStatus !== 'paid' && (
                      <form action={verifyStickerOrder.bind(null, order.id)}>
                        <Button type="submit" size="sm" aria-label="Verifikasi pembayaran order">
                          Verifikasi Bayar
                        </Button>
                      </form>
                    )}

                    {order.paymentStatus === 'paid' &&
                      order.bundles.length === 0 && (
                        <GenerateBundleButton orderId={order.id} />
                      )}

                    {order.status === 'in_production' && (
                      <form
                        action={updateStickerOrderStatus.bind(null, order.id, 'shipped')}
                      >
                        <Button type="submit" size="sm" variant="outline" aria-label="Tandai order sebagai dikirim">
                          Tandai Shipped
                        </Button>
                      </form>
                    )}

                    {order.status === 'shipped' && (
                      <form
                        action={updateStickerOrderStatus.bind(null, order.id, 'completed')}
                      >
                        <Button type="submit" size="sm" variant="outline" aria-label="Tandai order sebagai selesai">
                          Tandai Completed
                        </Button>
                      </form>
                    )}

                    <Link href={`/admin/sticker-orders/${order.id}`}>
                      <Button size="sm" variant="ghost" aria-label={`Lihat detail bundle order ${order.id}`}>
                        Lihat Detail Bundle
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={`/admin/sticker-orders?page=${page - 1}`}>
                <Button variant="outline" size="sm" aria-label="Halaman sebelumnya">
                  ← Sebelumnya
                </Button>
              </Link>
            )}
            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/admin/sticker-orders?page=${page + 1}`}>
                <Button variant="outline" size="sm" aria-label="Halaman selanjutnya">
                  Selanjutnya →
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
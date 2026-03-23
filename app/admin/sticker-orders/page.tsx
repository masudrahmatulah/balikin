import Link from 'next/link';
import { redirect } from 'next/navigation';
import { desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { stickerOrders } from '@/db/schema';
import { AdminHeader } from '@/components/admin/admin-header';
import { verifyStickerOrder, updateStickerOrderStatus, generateStickerBundle } from '@/app/actions/sticker-order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminStickerOrdersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-orders');
  }

  const orders = await db.query.stickerOrders.findMany({
    orderBy: [desc(stickerOrders.createdAt)],
    with: {
      user: true,
      bundles: {
        with: {
          tags: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <AdminHeader session={session} />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sticker Orders</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Verifikasi pembayaran dan generate bundle sticker pack.</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Kembali ke Admin</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-slate-600">Belum ada order sticker.</CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.id}</CardTitle>
                      <CardDescription>{order.recipientName} • {order.city} • {order.user?.email}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{order.paymentStatus}</Badge>
                      <Badge variant="outline">{order.status}</Badge>
                      <Badge variant="outline">bundle {order.bundles.length}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                    <div>WhatsApp: <span className="font-medium text-slate-900">{order.phone}</span></div>
                    <div>Total: <span className="font-medium text-slate-900">Rp{order.totalAmount.toLocaleString('id-ID')}</span></div>
                    <div>Pack: <span className="font-medium text-slate-900">{order.packQuantity} x {order.unitCountPerPack}</span></div>
                    <div>Alamat: <span className="font-medium text-slate-900">{order.city}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.paymentStatus !== 'paid' && (
                      <form action={async () => {
                        'use server';
                        await verifyStickerOrder(order.id);
                      }}>
                        <Button type="submit" size="sm">Verifikasi Bayar</Button>
                      </form>
                    )}

                    {order.paymentStatus === 'paid' && order.bundles.length === 0 && (
                      <form action={async () => {
                        'use server';
                        await generateStickerBundle(order.id);
                      }}>
                        <Button type="submit" size="sm" variant="outline">Generate Bundle 6 QR</Button>
                      </form>
                    )}

                    {order.status === 'in_production' && (
                      <form action={async () => {
                        'use server';
                        await updateStickerOrderStatus(order.id, 'shipped');
                      }}>
                        <Button type="submit" size="sm" variant="outline">Tandai Shipped</Button>
                      </form>
                    )}

                    {order.status === 'shipped' && (
                      <form action={async () => {
                        'use server';
                        await updateStickerOrderStatus(order.id, 'completed');
                      }}>
                        <Button type="submit" size="sm" variant="outline">Tandai Completed</Button>
                      </form>
                    )}

                    <Link href={`/admin/sticker-orders/${order.id}`}>
                      <Button size="sm" variant="ghost">Lihat Detail Bundle</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

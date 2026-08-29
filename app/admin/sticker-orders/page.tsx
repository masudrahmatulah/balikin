import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import {
  getStickerOrders,
  getStickerOrdersCount,
} from './data-access';
import { Button } from '@/components/ui/button';
import { StickerOrdersManager, type StickerOrderRow } from '@/components/admin/sticker-orders-manager';

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
  const [orders, totalCount] = await Promise.all([
    getStickerOrders(page),
    getStickerOrdersCount(),
  ]);

  const totalPages = Math.ceil(totalCount / 20);

  const rows: StickerOrderRow[] = orders.map((order) => ({
    id: order.id,
    recipientName: order.recipientName,
    phone: order.phone,
    city: order.city,
    email: order.user?.email ?? '-',
    totalAmount: order.totalAmount,
    packQuantity: order.packQuantity,
    unitCountPerPack: order.unitCountPerPack,
    paymentStatus: order.paymentStatus,
    status: order.status,
    bundleCount: order.bundles.length,
    productType: order.productType,
    stickerColorTheme: order.stickerColorTheme,
    backsideCustom: order.backsideCustom,
    backsideCustomImageUrl: order.backsideCustomImageUrl,
    createdAtLabel: order.createdAt
      ? new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      : '',
  }));

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sticker Orders
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kelola order sticker: verifikasi pembayaran, generate bundle, edit, hapus (satuan atau massal).
            </p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Kembali ke Admin</Button>
          </Link>
        </div>

        <StickerOrdersManager orders={rows} />

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
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getUpgradePayments, getStickerPaymentOrders, type PaymentStatus } from './data-access';
import { PaymentsTable } from '@/components/admin/payments-table';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { type?: string; status?: string };
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/payments');
  }

  const type = searchParams.type === 'sticker' || searchParams.type === 'upgrade'
    ? searchParams.type
    : 'all';
  const status: PaymentStatus | 'all' =
    searchParams.status === 'pending' || searchParams.status === 'paid' || searchParams.status === 'failed'
      ? searchParams.status
      : 'all';

  const [upgrades, stickers] = await Promise.all([
    type === 'sticker'
      ? Promise.resolve([])
      : getUpgradePayments(status === 'all' ? undefined : status),
    type === 'upgrade'
      ? Promise.resolve([])
      : getStickerPaymentOrders(status === 'all' ? undefined : status),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manajemen Pembayaran QRIS
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Semua pembayaran otomatis Komerce (upgrade tag &amp; sticker order), termasuk konfirmasi manual bila webhook terlewat.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Kembali ke Admin</Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(['all', 'upgrade', 'sticker'] as const).map((t) => (
          <Link
            key={t}
            href={`/admin/payments?type=${t}&status=${status}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              type === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {t === 'all' ? 'Semua' : t === 'upgrade' ? 'Upgrade Tag' : 'Sticker Order'}
          </Link>
        ))}
        <span className="mx-1 text-gray-300">|</span>
        {(['all', 'pending', 'paid', 'failed'] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/payments?type=${type}&status=${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {s === 'all' ? 'Semua Status' : s === 'pending' ? 'Pending' : s === 'paid' ? 'Lunas' : 'Gagal'}
          </Link>
        ))}
      </div>

      <PaymentsTable upgrades={upgrades} stickers={stickers} />
    </div>
  );
}
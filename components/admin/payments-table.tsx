'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  verifyTagUpgradePayment,
  markTagUpgradeFailed,
  verifyStickerOrderPayment,
} from '@/app/admin/payments/actions';

interface UpgradeRow {
  id: string;
  amount: number;
  totalAmount?: number;
  paymentStatus: string;
  createdAt: Date | null;
  tag: { id: string; slug: string; name: string | null; tier: string | null } | null;
  user: { id: string; email: string | null; name: string | null } | null;
}

interface StickerRow {
  id: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: Date | null;
  recipientName: string;
  city: string;
  user: { id: string; email: string | null; name: string | null } | null;
}

interface PaymentsTableProps {
  upgrades: UpgradeRow[];
  stickers: StickerRow[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    paid: 'Lunas',
    pending: 'Pending',
    failed: 'Gagal',
  };
  return (
    <Badge className={styles[status] || 'bg-gray-100 text-gray-700'}>
      {labels[status] || status}
    </Badge>
  );
}

function formatDate(date: Date | null) {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function PaymentsTable({ upgrades, stickers }: PaymentsTableProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (key: string, action: () => Promise<unknown>) => {
    setPendingAction(key);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
      } finally {
        setPendingAction(null);
      }
    });
  };

  const hasData = upgrades.length > 0 || stickers.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-gray-600">
          Tidak ada pembayaran yang cocok dengan filter.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {upgrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upgrade Tag Premium</CardTitle>
            <CardDescription>
              Pembayaran upgrade tag free → premium via QRIS (Komerce).
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Tag</th>
                  <th className="pb-2 pr-4">Pemilik</th>
                  <th className="pb-2 pr-4">Jumlah</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Waktu</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {upgrades.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {row.tag?.name || row.tag?.slug || '-'}
                      <span className="block text-xs text-gray-500">{row.tag?.slug}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {row.user?.name || '-'}
                      <span className="block text-xs text-gray-500">{row.user?.email}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-900">
                      Rp{(row.amount ?? row.totalAmount ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={row.paymentStatus} />
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(row.createdAt)}</td>
                    <td className="py-3">
                      {row.paymentStatus === 'pending' && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              runAction(`upgrade-paid-${row.id}`, () =>
                                verifyTagUpgradePayment(row.id)
                              )
                            }
                            disabled={isPending && pendingAction === `upgrade-paid-${row.id}`}
                          >
                            {isPending && pendingAction === `upgrade-paid-${row.id}` ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Konfirmasi Bayar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              runAction(`upgrade-fail-${row.id}`, () =>
                                markTagUpgradeFailed(row.id)
                              )
                            }
                            disabled={isPending && pendingAction === `upgrade-fail-${row.id}`}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Tandai Gagal
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {stickers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sticker Order</CardTitle>
            <CardDescription>
              Pembayaran order sticker pack via QRIS (Komerce / manual).
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Order</th>
                  <th className="pb-2 pr-4">Pemesan</th>
                  <th className="pb-2 pr-4">Jumlah</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Waktu</th>
                  <th className="pb-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stickers.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {row.recipientName}
                      <span className="block text-xs text-gray-500">{row.city}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {row.user?.name || '-'}
                      <span className="block text-xs text-gray-500">{row.user?.email}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-900">
                      Rp{(row.amount ?? row.totalAmount ?? 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={row.paymentStatus} />
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(row.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.paymentStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              runAction(`sticker-paid-${row.id}`, () =>
                                verifyStickerOrderPayment(row.id)
                              )
                            }
                            disabled={isPending && pendingAction === `sticker-paid-${row.id}`}
                          >
                            {isPending && pendingAction === `sticker-paid-${row.id}` ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Verifikasi Bayar
                          </Button>
                        )}
                        <Link href={`/admin/sticker-orders/${row.id}`}>
                          <Button size="sm" variant="ghost">
                            Detail
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
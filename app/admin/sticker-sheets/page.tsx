import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getStickerSheets, getStickerSheetsStats } from './data-access';
import { StickerSheetsTable } from '@/components/admin/sticker-sheets-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function AdminStickerSheetsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/sticker-sheets');
  }

  const [sheets, stats] = await Promise.all([
    getStickerSheets(),
    getStickerSheetsStats(),
  ]);

  return (
    <div className="space-y-6" role="main" aria-label="Manajemen Master PIN Stiker">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Master PIN Stiker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Cari lembar stiker (VDP) dan lihat Master PIN aktivasinya untuk membantu customer yang lupa PIN.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Lembar</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sudah Diaktivasi</CardDescription>
            <CardTitle className="text-2xl">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Belum Diaktivasi</CardDescription>
            <CardTitle className="text-2xl">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <StickerSheetsTable sheets={sheets} />
      </div>
    </div>
  );
}

import { TagCard } from '@/components/tag-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Plus } from 'lucide-react';
import Link from 'next/link';

interface DashboardTagListProps {
  tags: Array<{ id: string; scanCount: number; ownerEmail: string | null } & Record<string, unknown>>;
  canCreateMore: boolean;
}

export function DashboardTagList({ tags, canCreateMore }: DashboardTagListProps) {
  return (
    <section id="tags" className="mb-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Smart Tag Saya</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pantau status, scan, dan mode hilang setiap barang.</p>
        </div>
        <Link href="/dashboard/new">
          <Button disabled={!canCreateMore} size="sm" className="gap-2 bg-blue-600 shadow-md shadow-blue-600/20 hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tambah Tag</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </Link>
      </div>

      {tags.length === 0 ? (
        <Card className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/60 dark:to-purple-950/50">
              <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-300" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Belum Ada Tag</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Buat tag pertama Anda untuk melindungi barang berharga
            </p>
            <Link href="/dashboard/new" className="mt-4 inline-block">
              <Button size="sm">Buat Tag Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tags.map((tag) => (
            <TagCard key={tag.id} {...(tag as any)} />
          ))}
        </div>
      )}
    </section>
  );
}

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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Tag Saya</h3>
        <Link href="/dashboard/new">
          <Button disabled={!canCreateMore} size="sm" className="gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tambah Tag</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </Link>
      </div>

      {tags.length === 0 ? (
        <Card className="border border-slate-200 bg-white">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <QrCode className="h-8 w-8 text-slate-400" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Belum Ada Tag</h3>
            <p className="mt-2 text-sm text-slate-600">
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
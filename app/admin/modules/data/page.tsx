import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { otomotifData, pertanianData, tags, user } from '@/db/schema';

export const dynamic = 'force-dynamic';

export default async function AdminModuleDataPage() {
  if (!(await getAdminSession())) redirect('/sign-in?redirect=/admin/modules/data');

  const [otomotif, pertanian] = await Promise.all([
    db.select({ id: otomotifData.id, tagId: otomotifData.tagId, tagName: tags.name, slug: tags.slug, ownerEmail: user.email, updatedAt: otomotifData.updatedAt })
      .from(otomotifData)
      .leftJoin(tags, eq(otomotifData.tagId, tags.id))
      .leftJoin(user, eq(otomotifData.userId, user.id)),
    db.select({ id: pertanianData.id, tagId: pertanianData.tagId, tagName: tags.name, slug: tags.slug, ownerEmail: user.email, updatedAt: pertanianData.updatedAt })
      .from(pertanianData)
      .leftJoin(tags, eq(pertanianData.tagId, tags.id))
      .leftJoin(user, eq(pertanianData.userId, user.id)),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Data Modul per Tag</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Kelola data Otomotif dan Pertanian yang terhubung ke setiap tag.</p>
      </header>
      <ModuleDataTable title="Otomotif" rows={otomotif} hrefPrefix="otomotif" />
      <ModuleDataTable title="Pertanian" rows={pertanian} hrefPrefix="pertanian" />
    </div>
  );
}

function ModuleDataTable({ title, rows, hrefPrefix }: { title: string; rows: Array<{ id: string; tagId: string | null; tagName: string | null; slug: string | null; ownerEmail: string | null; updatedAt: Date | null }>; hrefPrefix: string }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2></div>
      {rows.length === 0 ? <p className="p-5 text-sm text-slate-500">Belum ada data per tag.</p> : <div className="divide-y divide-slate-200 dark:divide-slate-700">{rows.map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-medium text-slate-900 dark:text-white">{row.tagName || row.slug || 'Tag tanpa nama'}</p><p className="text-sm text-slate-500">{row.ownerEmail || 'Pemilik tidak ditemukan'} · {row.tagId ? 'Terhubung ke tag' : 'Data lama tanpa tag'}</p></div><a href={`/admin/modules/data/${hrefPrefix}/${row.id}`} className="rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark">Kelola Data</a></div>)}</div>}
    </section>
  );
}

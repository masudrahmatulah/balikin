import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { otomotifData, pertanianData } from '@/db/schema';
import { updateAdminOtomotifData, updateAdminPertanianData } from '@/app/actions/admin-module-data-actions';

interface Props { params: Promise<{ moduleType: string; id: string }> }

export default async function AdminModuleDataEditPage({ params }: Props) {
  if (!(await getAdminSession())) redirect('/sign-in?redirect=/admin/modules/data');
  const { moduleType, id } = await params;
  if (moduleType !== 'otomotif' && moduleType !== 'pertanian') notFound();

  if (moduleType === 'otomotif') {
    const data = await db.query.otomotifData.findFirst({ where: eq(otomotifData.id, id) });
    if (!data) notFound();
    return <ModuleDataLayout title="Otomotif" tagId={data.tagId}><OtomotifForm id={id} data={data} /></ModuleDataLayout>;
  }

  const data = await db.query.pertanianData.findFirst({ where: eq(pertanianData.id, id) });
  if (!data) notFound();
  return <ModuleDataLayout title="Pertanian" tagId={data.tagId}><PertanianForm id={id} data={data} /></ModuleDataLayout>;
}

function ModuleDataLayout({ title, tagId, children }: { title: string; tagId: string | null; children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-6"><header><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kelola Data {title}</h1><p className="mt-2 text-sm text-slate-500">ID Tag: {tagId || 'Data lama tanpa tag'}</p></header>{children}</div>;
}

function OtomotifForm({ id, data }: { id: string; data: typeof otomotifData.$inferSelect }) {
  return <form action={updateAdminOtomotifData.bind(null, id)} className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2"><Field label="Nomor STNK" name="stnkNumber" value={data.stnkNumber} /><Field label="Jatuh Tempo STNK" name="stnkExpiryDate" type="date" value={data.stnkExpiryDate ? new Date(data.stnkExpiryDate).toISOString().slice(0, 10) : ''} /><Field label="Jadwal Ganti Oli" name="oilChangeSchedule" value={data.oilChangeSchedule} /><Field label="Nomor Asuransi" name="insuranceNumber" value={data.insuranceNumber} /><Field label="Provider Asuransi" name="insuranceProvider" value={data.insuranceProvider} /><TextArea label="Riwayat Servis" name="serviceHistory" value={data.serviceHistory} /><button className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark sm:col-span-2">Simpan Perubahan</button></form>;
}

function PertanianForm({ id, data }: { id: string; data: typeof pertanianData.$inferSelect }) {
  return <form action={updateAdminPertanianData.bind(null, id)} className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2"><TextArea label="Kalkulator HST" name="hstCalculator" value={data.hstCalculator} /><TextArea label="Jadwal Pemupukan" name="fertilizerSchedule" value={data.fertilizerSchedule} /><TextArea label="Catatan Panen" name="harvestLog" value={data.harvestLog} /><TextArea label="Biaya Tenaga Kerja" name="laborCostNotes" value={data.laborCostNotes} /><button className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white hover:bg-brand-red-dark sm:col-span-2">Simpan Perubahan</button></form>;
}

function Field({ label, name, value, type = 'text' }: { label: string; name: string; value: string | null; type?: string }) { return <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">{label}<input name={name} type={type} defaultValue={value || ''} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800" /></label>; }
function TextArea({ label, name, value }: { label: string; name: string; value: string | null }) { return <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">{label}<textarea name={name} defaultValue={value || ''} rows={4} className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-600 dark:bg-slate-800" /></label>; }

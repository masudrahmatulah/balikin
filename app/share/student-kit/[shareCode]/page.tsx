import { notFound, redirect } from 'next/navigation';
import { getScheduleByShareCode } from '@/app/actions/modules';
import { ImportSharedScheduleButton } from './import-shared-schedule-button';
import { getSession } from '@/lib/session';

interface SharePageProps {
  params: Promise<{ shareCode: string }>;
}

export const metadata = {
  title: 'Bagikan Jadwal Student Kit - Balikin',
  robots: 'noindex, nofollow',
};

export default async function StudentKitSharePage({ params }: SharePageProps) {
  const { shareCode } = await params;
  const returnTo = `/share/student-kit/${encodeURIComponent(shareCode)}`;
  if (!(await getSession())) {
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  }

  try {
    await getScheduleByShareCode(shareCode);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Jadwal Student Kit dibagikan</h1>
      <p className="mt-4 text-muted-foreground">
        Dengan melanjutkan, jadwal kelas, deadline tugas, dan tautan Drive dari
        pemilik tautan akan diimpor ke akun Anda. Data jadwal yang sudah ada
        akan dipertahankan sesuai aturan penggabungan impor.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Tautan ini berlaku selama 7 hari sejak dibuat. Setelah berhasil, buka
        menu Student Kit dari dashboard untuk melihat data yang diimpor.
      </p>
      <ImportSharedScheduleButton shareCode={shareCode} />
    </main>
  );
}

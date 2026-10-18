'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importSchedule } from '@/app/actions/modules';
import { Button } from '@/components/ui/button';

export function ImportSharedScheduleButton({ shareCode }: { shareCode: string }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleImport() {
    setLoading(true);
    setStatus('');
    try {
      await importSchedule(shareCode);
      setStatus('Jadwal berhasil diimpor. Mengarahkan ke dashboard…');
      router.push('/dashboard');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Gagal mengimpor jadwal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <Button onClick={handleImport} disabled={loading}>
        {loading ? 'Mengimpor…' : 'Impor jadwal ke akun saya'}
      </Button>
      {status && <p className="mt-3 text-sm" role="status">{status}</p>}
    </div>
  );
}

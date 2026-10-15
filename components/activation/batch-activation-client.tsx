'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { processBatchActivation, resumeBatchActivation } from '@/app/actions/activate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, PackageCheck, Shield } from 'lucide-react';

export function BatchActivationClient({
  batchId,
  isAuthenticated,
  initialError,
}: {
  batchId: string;
  isAuthenticated: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [claimCode, setClaimCode] = useState('');
  const [error, setError] = useState<string | null>(initialError || null);
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResuming, setIsResuming] = useState(isAuthenticated);
  const resumePromise = useRef<{ batchId: string; promise: ReturnType<typeof resumeBatchActivation> } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    if (resumePromise.current?.batchId !== batchId) {
      resumePromise.current = { batchId, promise: resumeBatchActivation(batchId) };
    }
    void resumePromise.current.promise.then((result) => {
      if (!active) return;
      setIsResuming(false);
      if (!result) return;
      if (result.success) {
        const count = result.claimedCount || 1;
        setClaimedCount(count);
        setTimeout(() => router.push(`/dashboard?activatedBatch=${count}`), 1800);
      } else {
        setError(result.error || 'Aktivasi gagal. Periksa kembali kode klaim.');
      }
    }).catch(() => {
      if (active) {
        setIsResuming(false);
        setError('Aktivasi belum dapat diproses. Masuk kembali lalu masukkan PIN paket, atau hubungi admin jika masalah berlanjut.');
      }
    });
    return () => { active = false; };
  }, [batchId, isAuthenticated, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const code = claimCode.trim().toUpperCase();
    if (!code) {
      setError('Masukkan kode klaim dari buku petunjuk dalam kemasan.');
      return;
    }

    startTransition(async () => {
      try {
        if (!isAuthenticated) {
          setError('Silakan masuk terlebih dahulu untuk mengaktifkan paket.');
          return;
        }

        const result = await processBatchActivation(batchId, code);
        if (result.success) {
          setClaimedCount(result.claimedCount || 1);
          setTimeout(() => router.push(`/dashboard?activatedBatch=${result.claimedCount || 1}`), 1800);
        } else {
          setError(result.error || 'Aktivasi gagal. Periksa kembali kode klaim.');
        }
      } catch (cause) {
        if (isRedirectError(cause)) throw cause;
        setError('Aktivasi belum dapat diproses. Periksa koneksi dan konfigurasi, lalu coba kembali.');
      }
    });
  };

  const handleCodeChange = (value: string) => {
    const characters = value.toUpperCase().replace(/[^0-9A-HJ-NP-Z]/g, '').slice(0, 8);
    setClaimCode(characters.length > 4 ? `${characters.slice(0, 4)}-${characters.slice(4)}` : characters);
  };

  if (claimedCount !== null) {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-600" />
          <CardTitle className="text-green-900">Paket Berhasil Diaktifkan</CardTitle>
          <CardDescription className="text-green-800">{claimedCount} tag sudah terhubung ke akun Anda.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-green-800">Mengalihkan ke dashboard…</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <PackageCheck className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle>Aktifkan Paket Balikin</CardTitle>
        <CardDescription>
          Masukkan satu kode klaim yang tercetak di buku petunjuk dalam kemasan. Semua tag dalam paket akan dihubungkan ke akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="claim-code" className="text-sm font-medium">Kode Klaim</label>
            <Input
              id="claim-code"
              value={claimCode}
              onChange={(event) => handleCodeChange(event.target.value)}
              placeholder="XXXX-XXXX"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              maxLength={9}
              disabled={isPending || isResuming}
              className="h-14 text-center font-mono text-2xl tracking-widest"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="h-12 w-full" disabled={isPending || isResuming}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
            {isPending ? 'Memverifikasi…' : isAuthenticated ? 'Aktifkan Seluruh Paket' : 'Lanjutkan ke Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

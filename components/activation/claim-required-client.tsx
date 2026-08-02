'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processActivation } from '@/app/actions/activate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Keyboard, QrCode, AlertCircle, Shield, CheckCircle2, Camera } from 'lucide-react';

interface ClaimRequiredClientProps {
  slug: string;
  initialToken?: string;
  isAuthenticated: boolean;
  user?: { name?: string | null; email?: string };
}

export function ClaimRequiredClient({
  slug,
  initialToken,
  isAuthenticated,
  user,
}: ClaimRequiredClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState(initialToken || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);

  // Check if we have a token from URL params
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setPin(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pin.trim()) {
      setError('Masukkan kode PIN manual');
      return;
    }

    startTransition(async () => {
      const result = await processActivation({
        slug,
        tokenOrPin: pin,
      });

      if (result.success) {
        setSuccess(true);
        setSerialNumber(result.serialNumber || null);

        setTimeout(() => {
          router.push('/dashboard?activated=true');
        }, 2000);
      } else {
        setError(result.error || 'Aktivasi gagal');
      }
    });
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle>Login Diperlukan</CardTitle>
          <CardDescription>
            Untuk mengklaim kepemilikan tag ini, silakan login atau daftar terlebih dahulu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/claim-required?slug=${slug}&token=${pin}`)}`)}
            className="w-full"
            size="lg"
          >
            Lanjut ke Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (success) {
    return (
      <Card className="w-full max-w-lg border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-green-900">Aktivasi Berhasil!</CardTitle>
          <CardDescription className="text-green-700">
            {serialNumber && `Nomor Seri: ${serialNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-100">
            <AlertDescription className="text-green-800">
              Selamat, {user?.name || 'User'}! Tag Anda telah berhasil diaktifkan dan sekarang terhubung ke akun Anda.
              Mengalihkan ke dashboard...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Keyboard className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl">Aktivasi Manual PIN</CardTitle>
        <CardDescription>
          Masukkan kode PIN yang tertera di buku panduan atau stiker aktivasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">
              <Keyboard className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="qr" disabled>
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Cara Menemukan PIN
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Buka buku panduan yang ada di dalam kemasan</li>
                  <li>Cari halaman dengan kode "SCAN UNTUK AKTIVASI"</li>
                  <li>Terdapat PIN 8 digit di bawah QR Code (format: XXXX-XXXX)</li>
                  <li>Masukkan PIN tersebut di kolom di bawah</li>
                </ol>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kode PIN Manual</label>
                  <Input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    disabled={isPending}
                    autoFocus
                    className="text-center text-2xl tracking-widest h-14 font-mono"
                    maxLength={9}
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: 4 karakter, tanda strip, 4 karakter (contoh: 9A3K-M82P)
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Aktivasi Sekarang
                    </>
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
              <Camera className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <h4 className="font-semibold text-orange-900 mb-2">Scan QR Code</h4>
              <p className="text-sm text-orange-800 mb-4">
                Fitur scan QR akan segera tersedia. Untuk sementara, gunakan input PIN manual.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t space-y-3">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Informasi Penting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>PIN bersifat <strong>case-insensitive</strong> (boleh huruf besar/kecil)</li>
              <li>PIN hanya bisa digunakan <strong>satu kali</strong></li>
              <li>Simpan buku panduan di tempat aman sebagai backup</li>
              <li>Jika PIN hilang, hubungi layanan pelanggan</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            Kembali ke Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { processActivation } from '@/app/actions/activate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode, Keyboard, Shield, CheckCircle2 } from 'lucide-react';

interface ActivationClientProps {
  slug: string;
  initialToken?: string;
  isAuthenticated: boolean;
  user?: { name?: string | null; email?: string };
}

export function ActivationClient({
  slug,
  initialToken,
  isAuthenticated,
  user,
}: ActivationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [token, setToken] = useState(initialToken || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Masukkan kode aktivasi atau PIN');
      return;
    }

    startTransition(async () => {
      const result = await processActivation({
        slug,
        tokenOrPin: token,
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Login Diperlukan</CardTitle>
          <CardDescription>
            Silakan login atau daftar untuk mengaktifkan tag Balikin Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/activate/${slug}?token=${token}`)}`)}
            className="w-full"
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle>Aktivasi Berhasil!</CardTitle>
          <CardDescription>
            {serialNumber && `Nomor Seri: ${serialNumber}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Selamat, {user?.name || 'User'}! Tag Anda telah berhasil diaktifkan.
              Mengalihkan ke dashboard...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <CardTitle>Aktivasi Tag Balikin</CardTitle>
        <CardDescription>
          Masukkan kode aktivasi dari QR Code atau PIN manual dari buku panduan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kode Aktivasi / PIN</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Scan QR atau ketik PIN (XXXX-XXXX)"
              disabled={isPending}
              autoFocus
              className="text-center text-lg tracking-wider"
              maxLength={20}
            />
            <p className="text-xs text-muted-foreground">
              Contoh: 9A3K-M82P atau scan QR Code dari buku manual
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Keyboard className="w-4 h-4 mr-2" />
                Aktivasi Tag
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Tips:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kode di QR Code dan PIN manual adalah sama</li>
              <li>Pastikan tidak ada spasi saat memasukkan PIN</li>
              <li>Kode bersifat case-insensitive</li>
              <li>Hanya bisa digunakan satu kali</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

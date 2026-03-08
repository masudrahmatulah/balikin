'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

function getAuthErrorMessage(error: unknown, fallback: string) {
  const maybeError = error as { message?: string; status?: number; statusCode?: number } | null;
  const message = maybeError?.message ?? '';
  const status = maybeError?.status ?? maybeError?.statusCode;

  if (status === 500 || /econnreset|internal_server_error|server error/i.test(message)) {
    return 'Layanan autentikasi sedang bermasalah. Silakan coba lagi beberapa saat.';
  }

  return message || fallback;
}

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const mode = searchParams.get('mode') || 'sign-in';
  const name = searchParams.get('name') || '';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP input - only numbers, max 6 digits
  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  const handleResendOTP = async () => {
    if (!email || countdown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });

      if (result?.error) {
        throw new Error(getAuthErrorMessage(result.error, 'Gagal mengirim ulang kode OTP'));
      }
      setCountdown(60); // 60 seconds cooldown
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, 'Gagal mengirim ulang kode');
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign in with email OTP
      const result = await authClient.signIn.emailOtp({
        email,
        otp,
        ...(name ? { name } : {}),
      });

      if (result.error) {
        setError(getAuthErrorMessage(result.error, 'Kode OTP tidak valid atau telah kadaluarsa'));
      } else if (result.data) {
        // Success - redirect to dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, 'Terjadi kesalahan. Silakan coba lagi.');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Verifikasi Kode OTP</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Masukkan 6 digit kode yang dikirim ke
            </p>
            <p className="text-sm font-medium mt-1">{email}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/15 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-center block">
                Kode Verifikasi
              </Label>
              <div className="flex justify-center">
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest w-full max-w-[200px] h-14 text-lg"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Masukkan 6 digit kode dari email
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Verifikasi'
              )}
            </Button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Tidak menerima kode?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={resendLoading || countdown > 0}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : countdown > 0 ? (
                `Kirim ulang (${countdown}s)`
              ) : (
                'Kirim ulang kode'
              )}
            </Button>
          </div>

          {/* Development Mode - Show OTP */}
          <div className="mt-6 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Development Mode:
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Cek terminal/server logs untuk kode OTP.
            </p>
            <code className="text-xs block mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded">
              OTP for {email}: XXXXXX
            </code>
          </div>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Balikin. Smart Lost & Found QR Tag.
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}

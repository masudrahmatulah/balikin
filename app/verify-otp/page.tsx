'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, isWhatsAppIdentifier } from '@/lib/auth-client';

// Inline button component to avoid import issues
function Button({ children, className, variant = 'default', size = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode; variant?: 'default' | 'ghost' | 'destructive'; size?: 'default' | 'sm' | 'lg' }) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

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

  const identifier = searchParams.get('identifier') || '';
  const display = searchParams.get('display') || identifier;
  const name = searchParams.get('name') || '';

  const isWhatsApp = isWhatsAppIdentifier(identifier);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Use useSession to get session data and refetch function
  const { data: session, refetch: refetchSession } = authClient.useSession();

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
    if (!identifier || countdown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      // Use better-auth's emailOtp method
      const { emailOtp } = authClient;

      const result = await emailOtp.sendVerificationOtp({
        email: identifier,
        type: 'sign-in',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Gagal mengirim ulang kode OTP');
      }

      setCountdown(60); // 60 seconds cooldown
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim ulang kode';
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
      // Use better-auth's signIn.emailOtp method
      const { signIn } = authClient;
      const redirectUrl = searchParams.get('redirect') || '/dashboard';

      console.log('[VERIFY OTP] Attempting sign in with:', { identifier, otp, redirectUrl });

      const result = await signIn.emailOtp({
        email: identifier,
        otp: otp,
      });

      console.log('[VERIFY OTP] Sign in result:', JSON.stringify(result, null, 2));

      // Handle synchronous error response
      if (result.error) {
        console.error('[VERIFY OTP] Sign in error:', result.error);
        setError(result.error.message || 'Kode OTP tidak valid atau telah kadaluarsa');
        setIsLoading(false);
        return;
      }

      // Check if we have session data in the response
      if (result.data) {
        console.log('[VERIFY OTP] Sign in successful, session data:', result.data);

        // CRITICAL: Verify session was actually created by refetching
        // This ensures the session is stored in database and cookie is set
        console.log('[VERIFY OTP] Fetching fresh session...');

        // Wait for cookie to be set
        await new Promise<void>(resolve => setTimeout(resolve, 1000));

        // Refetch session to verify it's stored
        const freshSession = await refetchSession();

        console.log('[VERIFY OTP] Fresh session after refetch:', freshSession);

        // Check if we have a valid session with user data
        if (freshSession?.user?.id) {
          console.log('[VERIFY OTP] Session validated, redirecting to:', redirectUrl);
          // Session is valid - redirect to dashboard
          window.location.href = redirectUrl;
        } else {
          console.error('[VERIFY OTP] Session not found after sign in!');
          setError('Login berhasil tapi sesi tidak tersimpan. Silakan coba lagi.');
          setIsLoading(false);
        }
      } else {
        // No session data returned - this shouldn't happen if sign-in succeeded
        console.error('[VERIFY OTP] No session data in response');
        setError('Gagal membuat sesi. Silakan coba lagi.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('[VERIFY OTP] Exception:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isWhatsApp ? 'bg-green-100 dark:bg-green-900/20' : 'bg-primary/10'
            }`}>
              {isWhatsApp ? (
                <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold break-words">Verifikasi Kode OTP</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Masukkan 6 digit kode yang dikirim ke
            </p>
            <p className="mt-1 break-all text-sm font-medium">{display}</p>
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
                  className="h-14 w-full max-w-[220px] text-center text-lg tracking-[0.45em] sm:max-w-[200px]"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Masukkan 6 digit kode dari {isWhatsApp ? 'WhatsApp' : 'email'}
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
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 p-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Development Mode:
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Cek terminal/server logs untuk kode OTP.
              </p>
              <code className="mt-2 block break-all rounded bg-yellow-100 p-2 text-xs dark:bg-yellow-900/40">
                OTP for {display}: XXXXXX
              </code>
            </div>
          )}

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
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
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

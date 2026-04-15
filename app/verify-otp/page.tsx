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
  const [isRedirecting, setIsRedirecting] = useState(false);
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

      const result = await signIn.emailOtp({
        email: identifier,
        otp: otp,
      });

      // Handle synchronous error response
      if (result.error) {
        // More specific error messages
        let errorMessage = result.error.message || 'Kode OTP tidak valid atau telah kadaluarsa';

        // Check if it's a specific error type
        if (result.error.status === 500) {
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
        } else if (/attempts|exceeded|too many/i.test(errorMessage)) {
          errorMessage = 'Terlalu banyak percobaan. Silakan minta kode OTP baru.';
        } else if (/expired/i.test(errorMessage)) {
          errorMessage = 'Kode OTP telah kadaluarsa. Silakan minta kode baru.';
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Check if we have session data in the response
      if (result.data) {
        // Set redirecting state to show success message
        setIsRedirecting(true);

        // Determine redirect destination based on user role
        // Note: better-auth doesn't return custom fields like 'role', so we need to fetch from database
        let isAdmin = false;
        try {
          const roleResponse = await fetch('/api/auth/role');
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            isAdmin = roleData.isAdmin;
          }
        } catch (err) {
          // Silently fail, default to user dashboard
        }

        // Check if there's a custom redirect parameter
        const customRedirect = searchParams.get('redirect');

        let finalRedirectUrl: string;
        if (customRedirect) {
          // Use custom redirect if provided (e.g., from a protected page)
          finalRedirectUrl = customRedirect;
        } else if (isAdmin) {
          // Admin users always go to admin dashboard
          finalRedirectUrl = '/admin';
        } else {
          // Regular users go to user dashboard
          finalRedirectUrl = '/dashboard';
        }

        // Delay to ensure cookie is processed by browser
        // Increased delay for better reliability, especially on slower connections
        await new Promise<void>(resolve => setTimeout(resolve, 2000));

        // Use window.location.href for full page reload to ensure cookies are properly set
        window.location.href = finalRedirectUrl;
      } else {
        // No session data returned - this shouldn't happen if sign-in succeeded
        setError('Gagal membuat sesi. Silakan coba lagi.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
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

          {/* Success Message - Redirecting */}
          {isRedirecting && (
            <div className="mb-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  Login berhasil! Mengalihkan ke dashboard...
                </p>
              </div>
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

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
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Fetch OTP from debug endpoint in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !identifier) return;

    const fetchDebugOtp = async () => {
      setDebugLoading(true);
      try {
        const response = await fetch(`/api/auth/debug/check-otp?identifier=${encodeURIComponent(identifier)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.validOTP && data.validOTP.length > 0) {
            setDebugOtp(data.validOTP[0].value);
            console.log('[DEBUG OTP] Found OTP in database:', data.validOTP[0]);
          } else {
            console.log('[DEBUG OTP] No valid OTP found in database', data);
          }
        }
      } catch (e) {
        console.error('[DEBUG OTP] Failed to fetch:', e);
      } finally {
        setDebugLoading(false);
      }
    };

    // Fetch immediately and every 5 seconds
    fetchDebugOtp();
    const interval = setInterval(fetchDebugOtp, 5000);
    return () => clearInterval(interval);
  }, [identifier]);

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
      console.log('[VERIFY OTP] Current cookies:', document.cookie);

      // Handle synchronous error response
      if (result.error) {
        console.error('[VERIFY OTP] Sign in error:', {
          message: result.error.message,
          status: result.error.status,
          fullError: result.error,
        });

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

        // Log to help debug
        console.log('[VERIFY OTP] Current OTP from DB:', debugOtp);
        console.log('[VERIFY OTP] User entered OTP:', otp);
        console.log('[VERIFY OTP] Match:', debugOtp === otp);

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Check if we have session data in the response
      if (result.data) {
        console.log('[VERIFY OTP] Sign in successful, session data:', result.data);

        // Set redirecting state to show success message
        setIsRedirecting(true);

        // Determine redirect destination based on user role
        // Admin users go to /admin, regular users go to /dashboard
        const userRole = (result.data.user as any)?.role || 'user';
        const isAdmin = userRole === 'admin';

        // Check if there's a custom redirect parameter
        const customRedirect = searchParams.get('redirect');

        let finalRedirectUrl: string;
        if (customRedirect) {
          // Use custom redirect if provided (e.g., from a protected page)
          finalRedirectUrl = customRedirect;
        } else if (isAdmin) {
          // Admin users always go to admin dashboard
          console.log('[VERIFY OTP] Admin user detected, redirecting to /admin');
          finalRedirectUrl = '/admin';
        } else {
          // Regular users go to user dashboard
          console.log('[VERIFY OTP] Regular user detected, redirecting to /dashboard');
          finalRedirectUrl = '/dashboard';
        }

        // Show success message to user before redirecting
        console.log('[VERIFY OTP] Login successful! Showing success message...');

        // Delay to ensure cookie is processed by browser
        // Increased delay for better reliability, especially on slower connections
        await new Promise<void>(resolve => setTimeout(resolve, 2000));

        console.log('[VERIFY OTP] Redirecting to:', finalRedirectUrl);
        console.log('[VERIFY OTP] Cookies available:', document.cookie);
        console.log('[VERIFY OTP] Session cookie:', document.cookie.includes('better-auth.session_token') ? 'Found' : 'Not found');

        // Use window.location.href for full page reload to ensure cookies are properly set
        window.location.href = finalRedirectUrl;
      } else {
        // No session data returned - this shouldn't happen if sign-in succeeded
        console.error('[VERIFY OTP] No session data in response');
        setError('Gagal membuat sesi. Silakan coba lagi.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('[VERIFY OTP] Exception:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      });
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

            {/* Development Mode - Auto-fill OTP */}
            {process.env.NODE_ENV !== 'production' && debugOtp && (
              <button
                type="button"
                onClick={() => setOtp(debugOtp)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Auto-fill OTP dari database
              </button>
            )}
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
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center justify-between">
                <span>Development Mode:</span>
                {debugLoading && <span className="text-xs opacity-70">Loading...</span>}
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                OTP dari database untuk {display}:
              </p>
              {debugOtp ? (
                <div className="flex items-center gap-2">
                  <code className="flex-1 block break-all rounded bg-yellow-100 p-2 text-lg font-mono text-center dark:bg-yellow-900/40">
                    {debugOtp}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(debugOtp);
                      // Optional: show copied feedback
                    }}
                    className="px-3 py-2 text-xs bg-yellow-200 hover:bg-yellow-300 rounded dark:bg-yellow-800 dark:hover:bg-yellow-700"
                    title="Copy OTP"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  <p className="mb-2">Belum ada OTP valid di database.</p>
                  <p className="text-[10px] opacity-75">
                    Pastikan Anda sudah meminta kode OTP. Refresh halaman untuk cek ulang.
                  </p>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-yellow-300 dark:border-yellow-700">
                <a
                  href={`/api/auth/debug/check-otp?identifier=${encodeURIComponent(identifier)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-yellow-800 dark:text-yellow-200 hover:underline"
                >
                  Lihat detail di debug endpoint →
                </a>
              </div>
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

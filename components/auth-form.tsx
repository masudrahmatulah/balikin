'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, formatWhatsAppEmail } from '@/lib/auth-client';

interface AuthFormProps {
  mode?: 'sign-in' | 'sign-up';
}

type AuthMethod = 'email' | 'whatsapp';

export function AuthForm({ mode = 'sign-in' }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('whatsapp');

  // Form states
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { signIn } = authClient;
      // Get redirect parameter for callback
      const redirectParam = searchParams.get('redirect') || '';

      // For admin users, we want to redirect to /admin after Google SSO
      // But better-auth social signIn doesn't have a built-in way to check role
      // So we'll use the role endpoint logic after successful login
      await signIn.social({
        provider: 'google',
        callbackURL: redirectParam || '/dashboard',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal login dengan Google. Silakan coba lagi.';
      setError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let identifier: string;
      let displayIdentifier: string;

      // Get emailOtp method from authClient
      const { emailOtp } = authClient;

      if (authMethod === 'whatsapp') {
        // Use better-auth's OTP method for WhatsApp
        identifier = formatWhatsAppEmail(whatsapp);
        displayIdentifier = whatsapp;
      } else {
        // Use better-auth's OTP method for Email
        identifier = email;
        displayIdentifier = email;
      }

      // Send OTP using better-auth's emailOtp method
      const result = await emailOtp.sendVerificationOtp({
        email: identifier,
        type: 'sign-in',
      });

      if (result.error) {
        throw new Error(result.error.message || 'Gagal mengirim kode OTP.');
      }

      setSuccess(true);

      // Get redirect parameter from current URL to pass it through
      const redirectParam = searchParams.get('redirect') || '';

      // Redirect to OTP verification page
      setTimeout(() => {
        const verifyUrl = new URL('/verify-otp', window.location.origin);
        verifyUrl.searchParams.set('identifier', identifier);
        verifyUrl.searchParams.set('display', displayIdentifier);
        verifyUrl.searchParams.set('method', authMethod);
        verifyUrl.searchParams.set('mode', mode);
        verifyUrl.searchParams.set('name', name);
        if (redirectParam) {
          verifyUrl.searchParams.set('redirect', redirectParam);
        }
        router.push(verifyUrl.pathname + verifyUrl.search);
      }, 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Kode OTP Terkirim!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Kami telah mengirimkan kode verifikasi ke{' '}
          <strong>{authMethod === 'whatsapp' ? whatsapp : email}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          Mengalihkan ke halaman verifikasi...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Google SSO Button - Priority at top */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 h-11"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        Lanjutkan dengan Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">
            ATAU
          </span>
        </div>
      </div>

      {/* Auth Method Toggle */}
      <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted p-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setAuthMethod('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === 'whatsapp'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Phone className="h-4 w-4" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            authMethod === 'email'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
      </div>

      {authMethod === 'whatsapp' ? (
        <div className="space-y-2">
          <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="08123456789"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="tel"
          />
          <p className="text-xs text-muted-foreground">
            Masukkan nomor WhatsApp Anda untuk menerima kode OTP
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
      )}

      {mode === 'sign-up' && (
        <div className="space-y-2">
          <Label htmlFor="name">Nama</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={mode === 'sign-up'}
            disabled={isLoading}
            autoComplete="name"
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            {mode === 'sign-in' ? (
              authMethod === 'whatsapp' ? 'Masuk dengan WhatsApp' : 'Masuk dengan Email'
            ) : (
              'Daftar Akun'
            )}
          </>
        )}
      </Button>

      <div className="text-center text-sm leading-6 text-muted-foreground">
        <p>
          {mode === 'sign-in' ? (
            <>
              Belum punya akun?{' '}
              <a href="/sign-up" className="text-primary hover:underline">
                Daftar sekarang
              </a>
            </>
          ) : (
            <>
              Sudah punya akun?{' '}
              <a href="/sign-in" className="text-primary hover:underline">
                Masuk
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  );
}

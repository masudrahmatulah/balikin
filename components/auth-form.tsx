'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const [authMethod, setAuthMethod] = useState<AuthMethod>('whatsapp');

  // Form states
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let identifier: string;
      let displayIdentifier: string;

      if (authMethod === 'whatsapp') {
        // Use Better Auth's unified OTP mechanism for WhatsApp
        identifier = formatWhatsAppEmail(whatsapp);
        displayIdentifier = whatsapp;

        const result = await authClient.emailOtp.sendVerificationOtp({
          email: identifier,
          type: 'sign-in',
        });
        if (result?.error) {
          throw new Error(result.error.message || 'Gagal mengirim kode OTP.');
        }
      } else {
        // Use Better Auth flow for Email
        const result = await authClient.emailOtp.sendVerificationOtp({
          email: email,
          type: 'sign-in',
        });
        if (result?.error) {
          throw new Error(result.error.message || 'Gagal mengirim kode OTP.');
        }
        identifier = email;
        displayIdentifier = email;
      }

      setSuccess(true);

      // Redirect to OTP verification page
      setTimeout(() => {
        router.push(
          `/verify-otp?` +
          `identifier=${encodeURIComponent(identifier)}` +
          `&display=${encodeURIComponent(displayIdentifier)}` +
          `&method=${authMethod}` +
          `&mode=${mode}` +
          `&name=${encodeURIComponent(name)}`
        );
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

      {process.env.NODE_ENV !== 'production' && (
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Mode: <span className="font-mono">Dev - Cek terminal untuk kode OTP</span>
          </p>
        </div>
      )}
    </form>
  );
}

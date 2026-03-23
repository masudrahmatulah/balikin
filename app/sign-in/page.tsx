import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth-form';
import { MessageCircle } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = buildMetadata({
  title: 'Masuk',
  description: 'Masuk ke akun Balikin.',
  path: '/sign-in',
  noIndex: true,
});

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold break-words">Masuk ke Balikin</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Masukkan nomor WhatsApp atau email Anda untuk menerima kode OTP
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm mode="sign-in" />

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Kembali ke Beranda
            </Link>
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

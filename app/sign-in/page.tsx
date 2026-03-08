import { AuthForm } from '@/components/auth-form';
import { Mail } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Masuk ke Balikin</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Masukkan email Anda untuk menerima kode OTP
            </p>
          </div>

          {/* Auth Form */}
          <AuthForm mode="sign-in" />

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Kembali ke Beranda
            </a>
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

'use client';

import { Lock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthGateProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function AuthGate({ children, isAuthenticated }: AuthGateProps) {
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-full p-6 mb-6">
          <Lock className="w-12 h-12 text-amber-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Konten Privat Terkunci
        </h2>

        <p className="text-center text-gray-600 mb-6 max-w-md">
          Tab privat hanya dapat diakses oleh pemilik tag. Silakan
          login untuk melihat modul personal Anda.
        </p>

        <Alert className="mb-6 border-blue-200 bg-blue-50 max-w-md">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Privasi Terjaga:</strong> Data di tab privat tidak
            terindeks mesin pencari dan hanya Anda yang bisa
            mengaksesnya.
          </AlertDescription>
        </Alert>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href="/auth?redirectBack=true">Login Sekarang</a>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

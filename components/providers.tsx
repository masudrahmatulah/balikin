'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { authClient } from '@/lib/auth-client';
import { PWAServiceWorker } from '@/components/pwa-service-worker';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <PWAServiceWorker />
        {children}
        <Toaster position="top-right" richColors closeButton />
      </ThemeProvider>
  );
}

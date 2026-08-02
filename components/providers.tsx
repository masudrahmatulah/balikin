'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { authClient } from '@/lib/auth-client';
import { PWAServiceWorker } from '@/components/pwa-service-worker';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <PWAServiceWorker />
      {children}
    </ThemeProvider>
  );
}

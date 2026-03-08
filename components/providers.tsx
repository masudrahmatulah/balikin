'use client';

import type { ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

// Better Auth doesn't export AuthProvider directly
// Instead, we use the authClient for client-side operations
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function setOwnPassword(newPassword: string) {
  if (newPassword.length < 8 || newPassword.length > 64) {
    return { error: 'Password harus terdiri dari 8 sampai 64 karakter.' };
  }

  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    });

    return { success: true };
  } catch {
    return { error: 'Gagal menetapkan password. Silakan coba lagi.' };
  }
}

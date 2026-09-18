'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

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

function formatWhatsAppIdentifier(phone: string) {
  let normalized = phone.replace(/\D/g, '');
  if (normalized.startsWith('0')) normalized = `62${normalized.slice(1)}`;
  return `${normalized}@wa.dev`;
}

export async function requestWhatsAppPasswordReset(phone: string) {
  const identifier = formatWhatsAppIdentifier(phone);

  if (identifier.length < 14) {
    return { error: 'Nomor WhatsApp tidak valid.' };
  }

  const registeredUser = await db.query.user.findFirst({
    where: and(eq(user.email, identifier), eq(user.app_id, 'balikin_id')),
    columns: { id: true },
  });

  if (!registeredUser) {
    return { error: 'Nomor WhatsApp belum terdaftar pada akun mana pun.' };
  }

  try {
    await auth.api.requestPasswordResetEmailOTP({
      body: { email: identifier },
      headers: await headers(),
    });
    return { success: true };
  } catch {
    return { error: 'Gagal mengirim OTP WhatsApp. Silakan coba lagi.' };
  }
}

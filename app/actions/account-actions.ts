'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { checkRateLimitByType } from '@/lib/rate-limit';

// Pesan generik agar tidak bisa dipakai enumerasi nomor terdaftar.
const RESET_ACK = 'Jika nomor WhatsApp terdaftar, kode OTP telah dikirim. Berlaku 5 menit.';

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
  if (!/^62\d{9,13}$/.test(normalized)) return null;
  return `${normalized}@wa.dev`;
}

export async function requestWhatsAppPasswordReset(phone: string) {
  const identifier = formatWhatsAppIdentifier(phone);

  if (!identifier) {
    return { error: 'Nomor WhatsApp tidak valid. Gunakan format 08xx atau 628xx.' };
  }

  const limit = await checkRateLimitByType(`pwdreset:${identifier}`, 'auth');
  if (!limit.allowed) {
    return { error: 'Terlalu banyak permintaan. Coba lagi beberapa menit.' };
  }

  const registeredUser = await db.query.user.findFirst({
    where: and(eq(user.email, identifier), eq(user.app_id, 'balikin_id')),
    columns: { id: true },
  });

  // Selalu respons generik: jangan bocorkan nomor terdaftar atau belum.
  if (!registeredUser) {
    return { success: true, message: RESET_ACK };
  }

  try {
    await auth.api.requestPasswordResetEmailOTP({
      body: { email: identifier },
      headers: await headers(),
    });
    return { success: true, message: RESET_ACK };
  } catch {
    return { error: 'Gagal mengirim OTP WhatsApp. Silakan coba lagi.' };
  }
}

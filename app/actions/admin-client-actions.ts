'use server';

import { db } from '@/db';
import { user, tags } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation helpers
 */
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function sanitizeInput(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength);
}

export interface CreateClientInput {
  name: string | null;
  email: string;
  role: 'admin' | 'user';
}

export interface UpdateClientInput {
  name: string | null;
  email: string;
  role: 'admin' | 'user';
}

/**
 * Helper to get admin session directly in server actions
 * This avoids closure/serialization issues with helper functions
 */
async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Query database to get the user's role (better-auth doesn't return custom fields)
  const dbUser = await db.query.user.findFirst({
    where: and(eq(user.id, session.user.id), eq(user.appId, 'balikin_id')),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: dbUser.role as "admin",
    },
  };
}

/**
 * Create a new client/user
 */
export async function createClient(data: CreateClientInput) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Sanitize and validate input
    const sanitizedName = sanitizeInput(data.name || '', MAX_NAME_LENGTH);
    const sanitizedEmail = sanitizeInput(data.email, MAX_EMAIL_LENGTH);

    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return { error: 'Format email tidak valid' };
    }

    // Check email uniqueness with count query
    const emailCount = await db.select({ count: count() })
      .from(user)
      .where(and(eq(user.email, sanitizedEmail), eq(user.appId, 'balikin_id')))
      .then(rows => rows[0]?.count || 0);

    if (emailCount > 0) {
      return { error: 'Email sudah terdaftar' };
    }

    // Create user
    await db.insert(user).values({
      id: crypto.randomUUID(),
      appId: 'balikin_id',
      name: sanitizedName || null,
      email: sanitizedEmail,
      role: data.role,
      emailVerified: false,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Gagal membuat klien' };
  }
}

/**
 * Update existing client/user
 */
export async function updateClient(userId: string, data: UpdateClientInput) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Check if updating self
    if (adminSession.user.id === userId) {
      return { error: 'Tidak bisa mengubah data sendiri' };
    }

    // Sanitize and validate input
    const sanitizedName = sanitizeInput(data.name || '', MAX_NAME_LENGTH);
    const sanitizedEmail = sanitizeInput(data.email, MAX_EMAIL_LENGTH);

    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return { error: 'Format email tidak valid' };
    }

    // Check email uniqueness with count query (excluding current user)
    const emailCount = await db.select({ count: count() })
      .from(user)
      .where(and(
        eq(user.email, sanitizedEmail),
        eq(user.appId, 'balikin_id'),
        // Not using neq directly, using client-side check after query
      ))
      .then(rows => rows[0]?.count || 0);

    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      return { error: 'User tidak ditemukan' };
    }

    // If email is being changed and it's already used by another user
    if (existingUser.email !== sanitizedEmail && emailCount > 0) {
      return { error: 'Email sudah digunakan user lain' };
    }

    // Update user
    await db.update(user)
      .set({
        name: sanitizedName || null,
        email: sanitizedEmail,
        role: data.role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath('/admin');
    revalidatePath(`/admin/client/${userId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Gagal mengupdate klien' };
  }
}

/**
 * Delete a client/user with cascade delete of their tags
 */
export async function deleteClient(userId: string) {
  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      return { error: 'Unauthorized: Admin access required' };
    }

    // Check if deleting self
    if (adminSession.user.id === userId) {
      return { error: 'Tidak bisa menghapus akun sendiri' };
    }

    // Get user info with count of tags
    const clientUser = await db.query.user.findFirst({
      where: and(eq(user.id, userId), eq(user.appId, 'balikin_id')),
      with: {
        tags: {
          columns: { id: true },
        },
      },
    });

    if (!clientUser) {
      return { error: 'User tidak ditemukan' };
    }

    const tagCount = clientUser.tags.length;

    // Cascade delete: delete all tags first (if any)
    if (tagCount > 0) {
      await db.delete(tags).where(eq(tags.ownerId, userId));
    }

    // Then delete the user
    await db.delete(user).where(and(eq(user.id, userId), eq(user.appId, 'balikin_id')));

    // Revalidate path
    revalidatePath('/admin');

    return {
      success: true,
      deletedUserName: clientUser.name || clientUser.email,
      deletedTagCount: tagCount,
    };
  } catch (error) {
    return { error: 'Gagal menghapus klien. Silakan coba lagi.' };
  }
}

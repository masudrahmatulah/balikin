'use server';

import { db } from '@/db';
import { user, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

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
    where: eq(user.id, session.user.id),
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
  console.log('[createClient] Creating client:', data.email);

  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      console.error('[createClient] No admin session');
      return { error: 'Unauthorized: Admin access required' };
    }

    // Check email uniqueness
    const existing = await db.select().from(user).where(eq(user.email, data.email)).limit(1);

    if (existing && existing.length > 0) {
      console.error('[createClient] Email exists:', data.email);
      return { error: 'Email sudah terdaftar' };
    }

    // Create user
    await db.insert(user).values({
      id: crypto.randomUUID(),
      app_id: 'balikin_id',
      name: data.name,
      email: data.email,
      role: data.role,
      emailVerified: false,
    });

    console.log('[createClient] Success');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('[createClient] Error:', error);
    return { error: 'Gagal membuat klien' };
  }
}

/**
 * Update existing client/user
 */
export async function updateClient(userId: string, data: UpdateClientInput) {
  console.log('[updateClient] Updating user:', userId);

  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      console.error('[updateClient] No admin session');
      return { error: 'Unauthorized: Admin access required' };
    }

    // Check if updating self
    if (adminSession.user.id === userId) {
      console.error('[updateClient] Cannot update self');
      return { error: 'Tidak bisa mengubah data sendiri' };
    }

    // Check email uniqueness
    const existing = await db.select().from(user).where(eq(user.email, data.email)).limit(1);

    if (existing && existing.length > 0 && existing[0].id !== userId) {
      console.error('[updateClient] Email used by another user');
      return { error: 'Email sudah digunakan user lain' };
    }

    // Update user
    await db.update(user)
      .set({
        name: data.name,
        email: data.email,
        role: data.role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    console.log('[updateClient] Success');
    revalidatePath('/admin');
    revalidatePath(`/admin/client/${userId}`);
    return { success: true };
  } catch (error) {
    console.error('[updateClient] Error:', error);
    return { error: 'Gagal mengupdate klien' };
  }
}

/**
 * Delete a client/user with cascade delete of their tags
 */
export async function deleteClient(userId: string) {
  console.log('[deleteClient] Starting deletion for user:', userId);

  try {
    const adminSession = await getAdminSession();

    if (!adminSession) {
      console.error('[deleteClient] No admin session found');
      return { error: 'Unauthorized: Admin access required' };
    }

    console.log('[deleteClient] Admin session:', adminSession.user.id);

    // Check if deleting self
    if (adminSession.user.id === userId) {
      console.error('[deleteClient] Attempting to delete self');
      return { error: 'Tidak bisa menghapus akun sendiri' };
    }

    // Get user info
    const clientUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

    if (!clientUser || clientUser.length === 0) {
      console.error('[deleteClient] User not found:', userId);
      return { error: 'User tidak ditemukan' };
    }

    console.log('[deleteClient] Found user:', clientUser[0].email);

    // Cascade delete: delete all tags first (if any)
    try {
      await db.delete(tags).where(eq(tags.ownerId, userId));
      console.log('[deleteClient] Tags deleted successfully');
    } catch (tagError) {
      console.warn('[deleteClient] Warning deleting tags:', tagError);
      // Continue with user deletion even if tag deletion fails
    }

    // Then delete the user
    await db.delete(user).where(eq(user.id, userId));
    console.log('[deleteClient] User deleted successfully');

    // Revalidate path
    revalidatePath('/admin');
    console.log('[deleteClient] Path revalidated');

    return {
      success: true,
      deletedUserName: clientUser[0].name || clientUser[0].email,
      deletedTagCount: 0, // Skip counting for now
    };
  } catch (error) {
    console.error('[deleteClient] Error:', error);
    if (error instanceof Error) {
      console.error('[deleteClient] Error message:', error.message);
      console.error('[deleteClient] Error stack:', error.stack);
    }
    return { error: 'Gagal menghapus klien. Silakan coba lagi.' };
  }
}

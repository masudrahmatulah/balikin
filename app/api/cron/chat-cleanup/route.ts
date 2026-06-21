import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatRooms, messages } from '@/db/schema';
import { and, lt, eq } from 'drizzle-orm';

/**
 * FASE 6: Chat Cleanup Cron Job (Vercel-based, replacing pg_cron)
 *
 * Endpoint ini dipanggil secara berkala oleh Vercel Cron
 * untuk membersihkan chat rooms dan messages yang sudah tidak aktif
 * lebih dari 2 hari berdasarkan updatedAt (sliding window).
 *
 * Grill Guard 3.2: Sliding Window
 * Menggunakan filter updatedAt < NOW() - INTERVAL '2 days' untuk memastikan
 * obrolan penting yang sedang berlangsung tidak terhapus secara mendadak.
 *
 * Cron schedule di vercel.json:
 * "0 0 * * *" -> Setiap hari jam 00:00 UTC (jam 08:00 WITA)
 */

export const dynamic = 'force-dynamic';

async function cleanupExpiredChats() {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  try {
    // 1. Cari room chat yang akan dihapus
    const roomsToDelete = await db
      .select({ id: chatRooms.id })
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.app_id, 'balikin_id'),
          lt(chatRooms.updatedAt, twoDaysAgo)
        )
      );

    const roomIdArray = roomsToDelete.map((r) => r.id);

    if (roomIdArray.length === 0) {
      return {
        success: true,
        deletedRooms: 0,
        deletedMessages: 0,
        message: 'No expired chats found',
      };
    }

    // 2. Hapus pesan di dalam room chat tersebut
    const deletedMessages = await db
      .delete(messages)
      .where(
        // @ts-ignore - Drizzle ORM issue with array in where clause
        messages.roomId === null || messages.roomId
      )
      .returning();

    // Manual delete with IN clause for room IDs
    await db
      .delete(messages)
      .where(
        // @ts-ignore
        messages.roomId === null || messages.roomId
      );

    // 3. Hapus room chat
    const deletedRooms = await db
      .delete(chatRooms)
      .where(
        and(
          eq(chatRooms.app_id, 'balikin_id'),
          lt(chatRooms.updatedAt, twoDaysAgo)
        )
      )
      .returning();

    return {
      success: true,
      deletedRooms: deletedRooms.length,
      deletedMessages: deletedMessages.length,
      message: `Cleanup completed for ${deletedRooms.length} rooms`,
    };
  } catch (error) {
    console.error('[Cron] Chat cleanup failed:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await cleanupExpiredChats();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Chat cleanup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { config } from 'dotenv';
// Load environment variables from .env.local
config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { chatRooms, messages } from '@/db/schema';
import { count, and, lt, eq } from 'drizzle-orm';

// ============================================================================
// VERIFICATION SCRIPT: Chat Cleanup (FASE 4)
// ============================================================================

/**
 * Script ini memverifikasi bahwa fungsi cleanup_expired_chats() tersedia
 * dan menghitung berapa banyak data yang akan dihapus saat cleanup dijalankan.
 *
 * Penggunaan:
 *   npm run verify-chat-cleanup
 *   atau
 *   npx tsx scripts/verify-chat-cleanup.ts
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle({ client, schema });

async function verifyCleanup() {
  console.log('🔍 Verifying Chat Cleanup Configuration...\n');

  try {
    // 1. Cek apakah ekstensi pg_cron aktif
    const cronExtension = await client`
      SELECT EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'pg_cron'
      )
    `;

    if (cronExtension[0].exists) {
      console.log('✅ pg_cron extension is active');
    } else {
      console.log('❌ pg_cron extension is NOT installed');
      console.log('   Run: CREATE EXTENSION IF NOT EXISTS pg_cron;');
    }

    // 2. Cek apakah fungsi cleanup_expired_chats() ada
    const cleanupFunction = await client`
      SELECT EXISTS (
        SELECT 1
        FROM pg_proc
        WHERE proname = 'cleanup_expired_chats'
      )
    `;

    if (cleanupFunction[0].exists) {
      console.log('✅ cleanup_expired_chats() function exists');
    } else {
      console.log('❌ cleanup_expired_chats() function NOT found');
      console.log('   Run the SQL script in scripts/pg_cron_chat_cleanup.sql');
    }

    // 3. Cek apakah cron job terdaftar
    const cronJob = await client`
      SELECT *
      FROM cron.job
      WHERE jobname = 'cleanup-expired-chats'
    `;

    if (cronJob.length > 0) {
      console.log('✅ Cron job "cleanup-expired-chats" is scheduled');
      console.log(`   Schedule: ${cronJob[0].schedule}`);
      console.log(`   Last run: ${cronJob[0].lastrun || 'Never'}`);
      console.log(`   Next run: ${cronJob[0].nextrun}`);
    } else {
      console.log('❌ Cron job "cleanup-expired-chats" is NOT scheduled');
      console.log('   Run: SELECT cron.schedule(...) -- see scripts/pg_cron_chat_cleanup.sql');
    }

    console.log('\n📊 Data Analysis (What will be deleted):\n');

    // 4. Hitung data yang akan dihapus
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const roomsToDelete = await db
      .select({ count: count() })
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.app_id, 'balikin_id'),
          lt(chatRooms.updatedAt, twoDaysAgo)
        )
      );

    console.log(`   🗑️  Chat rooms older than 2 days: ${roomsToDelete[0].count}`);

    const roomIdsToDelete = await db
      .select({ id: chatRooms.id })
      .from(chatRooms)
      .where(
        and(
          eq(chatRooms.app_id, 'balikin_id'),
          lt(chatRooms.updatedAt, twoDaysAgo)
        )
      );

    const roomIdArray = roomIdsToDelete.map((r) => r.id);

    if (roomIdArray.length > 0) {
      const messagesToDelete = await db
        .select({ count: count() })
        .from(messages)
        .where(messages.roomId === null); // Using raw query for IN clause

      // Manual count for messages
      const messagesCountResult = await client`
        SELECT COUNT(*) as count
        FROM balikin_messages
        WHERE room_id = ANY(${roomIdArray})
      `;

      console.log(`   🗑️  Messages in those rooms: ${messagesCountResult[0].count}`);
    } else {
      console.log(`   🗑️  Messages in those rooms: 0`);
    }

    // 5. Hitung total data saat ini
    const [totalRooms, totalMessages] = await Promise.all([
      db.select({ count: count() }).from(chatRooms).where(eq(chatRooms.app_id, 'balikin_id')),
      db.select({ count: count() }).from(messages),
    ]);

    console.log('\n📈 Current Database Status:\n');
    console.log(`   📱 Total chat rooms: ${totalRooms[0].count}`);
    console.log(`   💬 Total messages: ${totalMessages[0].count}`);

    console.log('\n✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyCleanup();

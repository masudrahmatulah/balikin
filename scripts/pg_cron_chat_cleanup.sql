-- ============================================================================
-- FASE 4: Chat Cleanup Job (PRD v2 - FASE 6)
-- ============================================================================
--
-- Deskripsi: Script ini menghapus chat rooms dan messages yang sudah tidak aktif
--            lebih dari 2 hari berdasarkan updatedAt (bukan createdAt).
--
-- Penggunaan:
-- 1. Buka Supabase SQL Editor
-- 2. Jalankan script ini sekali saja untuk membuat cron job
-- 3. Cron akan berjalan otomatis setiap hari jam 00:00 UTC
--
-- Grill Guard 3.2: Sliding Window pg_cron
-- Menggunakan filter updatedAt < NOW() - INTERVAL '2 days' untuk memastikan
-- obrolan penting yang sedang berlangsung tidak terhapus secara mendadak.
-- ============================================================================

-- 1. Aktifkan ekstensi pg_cron jika belum aktif
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Buat fungsi cleanup untuk chat rooms dan messages
CREATE OR REPLACE FUNCTION cleanup_expired_chats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Hapus pesan di dalam room chat yang berumur > 2 hari (berdasarkan updatedAt room)
  DELETE FROM balikin_messages
  WHERE room_id IN (
    SELECT id
    FROM balikin_chat_rooms
    WHERE
      app_id = 'balikin_id'
      AND updated_at < NOW() - INTERVAL '2 days'
  );

  -- Hapus entri room chat yang berumur > 2 hari
  DELETE FROM balikin_chat_rooms
  WHERE
    app_id = 'balikin_id'
    AND updated_at < NOW() - INTERVAL '2 days';

  RAISE NOTICE 'Cleanup completed for expired chats (older than 2 days)';
END;
$$;

-- 3. Jadwalkan cron job untuk berjalan setiap hari jam 00:00 UTC
--    (WITA = UTC+8, jadi jam 00:00 UTC = jam 08:00 WITA)
SELECT cron.schedule(
  'cleanup-expired-chats',              -- Nama job
  '0 0 * * *',                          -- Schedule: setiap hari jam 00:00 UTC
  'SELECT cleanup_expired_chats();'     -- Query yang dijalankan
);

-- 4. Verifikasi cron job
SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-chats';

-- ============================================================================
-- MANUAL CLEANUP (Jika perlu segera membersihkan data lama)
-- ============================================================================

-- Jalankan query ini secara manual jika ingin segera membersihkan data lama:
-- SELECT cleanup_expired_chats();

-- Untuk melihat berapa banyak data yang akan dihapus (tanpa menghapus):
-- SELECT
--   COUNT(*) as total_messages_to_delete
-- FROM balikin_messages
-- WHERE room_id IN (
--   SELECT id
--   FROM balikin_chat_rooms
--   WHERE
--     app_id = 'balikin_id'
--     AND updated_at < NOW() - INTERVAL '2 days'
-- );

-- SELECT
--   COUNT(*) as total_rooms_to_delete
-- FROM balikin_chat_rooms
-- WHERE
--   app_id = 'balikin_id'
--   AND updated_at < NOW() - INTERVAL '2 days';

-- ============================================================================
-- MEMBATALKAN CRON JOB (Jika tidak lagi diperlukan)
-- ============================================================================

-- SELECT cron.unschedule('cleanup-expired-chats');

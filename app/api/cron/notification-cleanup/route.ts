import { NextResponse } from 'next/server';
import { cleanupExpiredNotifications } from '@/app/actions/notifications';

/**
 * FASE 5: Notification Cleanup Cron Job
 *
 * Endpoint ini dipanggil secara berkala (misal: setiap jam)
 * untuk membersihkan notifikasi yang sudah kadaluarsa.
 *
 * Cron schedule di vercel.json:
 * "0 * * * *" -> Setiap jam
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Jalankan cleanup
    cleanupExpiredNotifications();

    return NextResponse.json({
      success: true,
      message: 'Notification cleanup completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Notification cleanup failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

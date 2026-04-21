import { NextRequest, NextResponse } from 'next/server';
import { processDeadlineReminders } from '@/lib/deadline-reminders';

/**
 * CRON JOB: /api/cron/deadline-reminders
 *
 * This endpoint is called by Vercel Cron Jobs twice daily (8:00 AM and 8:00 PM)
 * to check for upcoming assignment deadlines and send WhatsApp reminders.
 *
 * Cron schedule configured in vercel.ts:
 * crons: [{ path: '/api/cron/deadline-reminders', schedule: '0 8,20 * * *' }]
 *
 * Environment variables required:
 * - FONNTE_API_TOKEN: WhatsApp API access
 * - DATABASE_URL: Database connection
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Starting deadline reminders cron job...');

    const result = await processDeadlineReminders();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Deadline reminders job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST requests
export async function POST(request: NextRequest) {
  return GET(request);
}

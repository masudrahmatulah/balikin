import { NextRequest, NextResponse } from 'next/server';
import { processDeadlineReminders } from '@/lib/deadline-reminders';

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_EXECUTION_TIME = 280000;

function verifyCronAuthorization(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.warn('[Cron] CRON_SECRET not set, skipping auth check');
    return true;
  }

  const authHeader = request.headers.get('authorization');
  const xWebhookSignature = request.headers.get('x-vercel-cron-secret');

  return authHeader === `Bearer ${CRON_SECRET}` || xWebhookSignature === CRON_SECRET;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let cleanup = false;

  try {
    if (!verifyCronAuthorization(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), MAX_EXECUTION_TIME);
    });

    const workPromise = (async () => {
      try {
        console.log('[Cron] Starting deadline reminders cron job...');
        const result = await processDeadlineReminders();
        return result;
      } catch (error) {
        console.error('[Cron] Error in processDeadlineReminders:', error);
        throw error;
      }
    })();

    const result = await Promise.race([workPromise, timeoutPromise]);

    const executionTime = Date.now() - startTime;
    console.log(`[Cron] Completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      executionTimeMs: executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`[Cron] Failed after ${executionTime}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        executionTimeMs: executionTime,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
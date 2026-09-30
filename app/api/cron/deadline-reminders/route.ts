import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { processDeadlineReminders } from '@/lib/deadline-reminders';
import { isCronAuthorized } from '@/lib/cron-auth';
const MAX_EXECUTION_TIME = 280000;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const cleanup = false;

  try {
    if (!isCronAuthorized(request)) {
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

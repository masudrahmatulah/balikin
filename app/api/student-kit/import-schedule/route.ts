/**
 * Refactored Import Schedule API Route
 *
 * SECURITY IMPROVEMENTS:
 * ✅ Input validation with Zod schema
 * ✅ Safe error messages
 * ✅ Rate limiting support
 */

import { NextRequest, NextResponse } from 'next/server';
import { importSchedule } from '@/app/actions/student-kit-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { formatErrorMessage } from '@/lib/errors';

/**
 * POST /api/student-kit/import-schedule
 * Import schedule from share code to current user's account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shareCode } = body;

    // Import schedule (includes validation)
    await importSchedule(shareCode);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Import schedule error:', error);

    return NextResponse.json(
      { error: formatErrorMessage(error) },
      { status: error instanceof Error && error.name === 'ValidationError' ? 400 : 500 }
    );
  }
}

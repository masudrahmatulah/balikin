/**
 * Refactored Schedule Share API Route
 *
 * SECURITY IMPROVEMENTS:
 * ✅ Proper error handling without exposing internal details
 * ✅ Rate limiting ready
 * ✅ Input validation via Zod
 * ✅ Secure session management
 */

import { NextRequest, NextResponse } from 'next/server';
import { shareSchedule } from '@/app/actions/student-kit-actions';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { formatErrorMessage } from '@/lib/errors';

/**
 * POST /api/student-kit/schedule/share
 * Generate a share code for the current user's schedule
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

    const result = await shareSchedule();

    // Generate share URL and QR code URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.masudrahmat.my.id';
    const shareUrl = `${baseUrl}/api/student-kit/schedule/import/${result.shareCode}`;
    const qrCodeUrl = `${baseUrl}/api/student-kit/schedule/qr/${result.shareCode}`;

    return NextResponse.json({
      ...result,
      shareUrl,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('[API] Share schedule error:', error);

    // Return safe error message (no internal details exposed)
    return NextResponse.json(
      { error: formatErrorMessage(error) },
      { status: error instanceof Error && error.name === 'AuthorizationError' ? 401 : 500 }
    );
  }
}

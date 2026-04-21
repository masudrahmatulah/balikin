import { NextRequest, NextResponse } from 'next/server';
import { shareSchedule } from '@/app/actions/modules';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/student-kit/schedule/share
 * Generate a share code for the current user's schedule
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membagikan jadwal' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { importSchedule } from '@/app/actions/modules';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shareCode } = body;

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Kode berbagi diperlukan' },
        { status: 400 }
      );
    }

    const result = await importSchedule(shareCode);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Import schedule error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengimpor jadwal' },
      { status: 500 }
    );
  }
}

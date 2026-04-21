import { NextRequest, NextResponse } from 'next/server';
import { getScheduleByShareCode } from '@/app/actions/modules';

/**
 * GET /api/student-kit/schedule/import/[shareCode]
 * Retrieve schedule by share code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    const data = await getScheduleByShareCode(shareCode);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Get schedule by share code error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengambil jadwal' },
      { status: 404 }
    );
  }
}

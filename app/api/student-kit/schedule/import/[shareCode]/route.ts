import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getScheduleByShareCode } from '@/app/actions/modules';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/student-kit/schedule/import/[shareCode]
 * Retrieve schedule by share code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

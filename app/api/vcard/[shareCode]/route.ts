import { NextRequest, NextResponse } from 'next/server';
import { getVCardByShareCode } from '@/app/actions/modules';

/**
 * GET /api/vcard/[shareCode]
 * Retrieve vCard data by share code (public API)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params;

    const data = await getVCardByShareCode(shareCode);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Get vCard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'vCard tidak ditemukan' },
      { status: 404 }
    );
  }
}

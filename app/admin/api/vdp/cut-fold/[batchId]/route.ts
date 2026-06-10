import { NextRequest, NextResponse } from 'next/server';
import { generateCutFoldPDFByBatchId } from '@/app/actions/cut-fold-pdf';
import type { PaperSize } from '@/lib/sticker-template';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Get paperSize from query parameter (default: a3)
    const paperSizeParam = searchParams.get('paperSize');
    const paperSize: PaperSize = paperSizeParam === 'a4' ? 'a4' : 'a3';

    const pdfBuffer = await generateCutFoldPDFByBatchId(batchId, paperSize);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cut-fold-${batchId}-${paperSize}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating Cut & Fold PDF:', error);

    return NextResponse.json(
      { error: 'Failed to generate PDF', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { generateCutFoldPDFByBatchId } from '@/app/actions/cut-fold-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;

    const pdfBuffer = await generateCutFoldPDFByBatchId(batchId);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cut-fold-${batchId}.pdf"`,
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

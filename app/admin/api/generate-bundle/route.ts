import { NextRequest, NextResponse } from 'next/server';
import { generateStickerBundle } from '@/app/actions/sticker-order';
import { type StickerShape, type StickerSize } from '@/lib/sticker-template';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, stickerShape, stickerSize } = body as {
      orderId: string;
      stickerShape: StickerShape;
      stickerSize: StickerSize;
    };

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!stickerShape || !stickerSize) {
      return NextResponse.json({ error: 'Template selection is required' }, { status: 400 });
    }

    const bundle = await generateStickerBundle(orderId, stickerShape, stickerSize);

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error('Error generating bundle:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate bundle' },
      { status: 500 }
    );
  }
}

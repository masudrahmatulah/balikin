/**
 * VDP PNG Generation API with Streaming Output
 * Generates 4-column layout (2 tags × 2 columns: QR Utama + Logo/Foto) as PNG images
 */

import { NextRequest } from 'next/server';
import { generateVDPStream, generateBatchReprint, type TagVDPData } from '@/lib/vdp-engine';
import { deriveAcrylicShapeKey } from '@/lib/acrylic-shapes';
import { db } from '@/db';
import { tags, printBatches } from '@/db/schema';
import { isAdmin } from '@/lib/admin';
import { eq, inArray, asc } from 'drizzle-orm';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GenerateRequest {
  batchId?: string;
  tagIds?: string[];
  options?: {
    isReprint?: boolean;
    includeActivation?: boolean;
  };
}

/**
 * Convert AsyncGenerator<Buffer> to ReadableStream
 */
function asyncGeneratorToReadable(generator: AsyncGenerator<Buffer, void, unknown>): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(new Uint8Array(chunk));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * POST /api/vdp/generate-pdf
 *
 * Request body:
 * - batchId: Reprint existing batch
 * - tagIds: Generate new PNG for specific tags
 *
 * Response: PNG stream with proper headers (multipart PNG for multiple rows)
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body: GenerateRequest = await request.json();

    // Handle batch reprint
    if (body.batchId) {
      const generator = generateBatchReprint(body.batchId, db);
      const stream = asyncGeneratorToReadable(generator);

      return new Response(stream, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="balikin-batch-${body.batchId}.png"`,
          'Cache-Control': 'no-store, must-revalidate',
        },
      });
    }

    // Handle tag-based generation
    if (body.tagIds && body.tagIds.length > 0) {
      const tagsData = await db.query.tags.findMany({
        where: inArray(tags.id, body.tagIds),
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          activationPinPlain: true,
          activationTokenHash: true,
          isCustom: true,
          name: true,
          productType: true,
        },
        orderBy: [asc(tags.slug)],
      });

      const vdpTags: TagVDPData[] = tagsData.map((t) => ({
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || undefined,
        activationPinPlain: t.activationPinPlain || undefined,
        activationTokenHash: t.activationTokenHash || undefined,
        isCustom: t.isCustom || false,
        name: t.name,
      }));

      const shapeKey = deriveAcrylicShapeKey(tagsData[0]?.productType);
      const generator = generateVDPStream(vdpTags, shapeKey, body.options);
      const stream = asyncGeneratorToReadable(generator);

      return new Response(stream, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="balikin-tags.png"',
          'Cache-Control': 'no-store, must-revalidate',
        },
      });
    }

    return new Response('Invalid request: provide batchId or tagIds', { status: 400 });
  } catch (error) {
    console.error('VDP PNG generation error:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal server error',
      { status: 500 }
    );
  }
}

/**
 * VDP PNG Generation API with Streaming Output
 * Generates 4-column layout (2 tags × 2 columns: QR Utama + Logo/Foto) as PNG images
 */

import { NextRequest } from 'next/server';
import { generateVDPStream, generateBatchReprint, type TagVDPData } from '@/lib/vdp-engine';
import { deriveAcrylicShapeKey } from '@/lib/acrylic-shapes';
import { db } from '@/db';
import { tags, printBatches } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';
import { hasPermission } from '@/lib/admin-divisions';
import { and, eq, inArray, asc } from 'drizzle-orm';
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
    const admin = await getAdminSession();
    if (!admin) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (!hasPermission(admin.user.division, 'vdp_tool')) {
      return new Response('Forbidden', { status: 403 });
    }

    const body: GenerateRequest = await request.json();

    // Handle batch reprint
    if (body.batchId) {
      const batch = await db.query.printBatches.findFirst({
        where: and(
          eq(printBatches.id, body.batchId),
          eq(printBatches.app_id, 'balikin_id'),
        ),
        columns: { id: true },
      });
      if (!batch) {
        throw new Error('Batch not found');
      }

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
        where: and(
          inArray(tags.id, body.tagIds),
          eq(tags.app_id, 'balikin_id'),
        ),
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          isCustom: true,
          name: true,
          productType: true,
        },
        orderBy: [asc(tags.slug)],
      });

      const vdpTags: TagVDPData[] = tagsData.map((t) => ({
        productSlug: t.productType || '',
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || '',
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

/**
 * VDP PNG Generation API with Streaming Output
 * Generates 4-column layout (2 tags × 2 columns: QR Utama + Logo/Foto) as PNG images
 */

import type { NextRequest } from 'next/server';
import { generateVDPStream, generateBatchReprint, type TagVDPData } from '@/lib/vdp-engine';
import { deriveAcrylicShapeKey } from '@/lib/acrylic-shapes';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { getAdminSession } from '@/lib/admin';
import { getDefaultDivision, hasPermission } from '@/lib/admin-divisions';
import { and, eq, inArray, asc } from 'drizzle-orm';

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
    if (!hasPermission(admin.user.division || getDefaultDivision(), 'vdp_tool')) {
      return new Response('Forbidden', { status: 403 });
    }

    const body: GenerateRequest = await request.json();

    // Handle batch reprint. The identifier is a print_batches.id for modern
    // rows, or print_queue.batch_id for supported legacy rows.
    if (body.batchId) {
      const generator = generateBatchReprint(body.batchId, db);
      // Prime one chunk before returning headers so lookup and initial render
      // errors can be returned as readable HTTP errors rather than a broken PNG.
      const first = await generator.next();
      if (first.done) throw new Error('No printable tag data found for this batch');
      const stream = asyncGeneratorToReadable((async function* () {
        yield first.value;
        yield* generator;
      })());

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

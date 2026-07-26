import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printBatches, printQueue } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { generateVDPStream, type TagVDPData } from "@/lib/vdp-engine";
import { deriveAcrylicShapeKey } from "@/lib/acrylic-shapes";

export const dynamic = "force-dynamic";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;

    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check printBatches first (new VDP batches)
    const batch = await db.query.printBatches.findFirst({
      where: eq(printBatches.id, batchId),
      with: {
        tags: {
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
          orderBy: (tags: any, { asc }) => [asc(tags.slug)],
        },
      },
    });

    if (batch) {
      // Use new VDP stream engine
      const shapeKey = deriveAcrylicShapeKey(batch.tags[0]?.productType);
      const generator = generateVDPStream(
        batch.tags.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          serialNumber: t.serialNumber,
          activationPinPlain: t.activationPinPlain,
          activationTokenHash: t.activationTokenHash,
          isCustom: t.isCustom,
          name: t.name,
        })),
        shapeKey,
        { isReprint: true }
      );

      const stream = asyncGeneratorToReadable(generator);

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="batch-${batch.batchNumber}.png"`,
        },
      });
    }

    // Fallback to printQueue (legacy batches)
    const printQueueItem = await db.query.printQueue.findFirst({
      where: eq(printQueue.batchId, batchId),
    });

    if (!printQueueItem) {
      return new NextResponse("Batch not found", { status: 404 });
    }

    const batchTags = await db.query.tags.findMany({
      where: sql`${tags.slug} LIKE ${batchId + "-%"}`,
      orderBy: (tags, { asc }) => [asc(tags.slug)],
    });

    if (batchTags.length === 0) {
      return new NextResponse("No tags found for this batch", { status: 404 });
    }

    const vdpTags: TagVDPData[] = batchTags.map((tag) => ({
      id: tag.id,
      slug: tag.slug,
      isCustom: false,
      name: tag.name,
    }));

    const generator = generateVDPStream(vdpTags, deriveAcrylicShapeKey(printQueueItem.materialType));
    const stream = asyncGeneratorToReadable(generator);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="batch-${printQueueItem.batchName}.png"`,
      },
    });
  } catch (error) {
    console.error("Error downloading batch:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

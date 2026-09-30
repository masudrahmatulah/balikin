import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { tags, printBatches, printQueue } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { generateVDPStream, type TagVDPData } from "@/lib/vdp-engine";
import { deriveAcrylicShapeKey } from "@/lib/acrylic-shapes";

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

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
    if (!hasPermission(session.user.division, "vdp_batch_download")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check printBatches first (new VDP batches)
    const batch = await db.query.printBatches.findFirst({
      where: and(eq(printBatches.id, batchId), eq(printBatches.app_id, APP_ID)),
      with: {
        tags: {
          where: eq(tags.app_id, APP_ID),
          columns: {
            id: true,
            slug: true,
            serialNumber: true,
            isCustom: true,
            name: true,
            productType: true,
          },
          orderBy: (tagTable, { asc }) => [asc(tagTable.slug)],
        },
      },
    });

    if (batch) {
      // Use new VDP stream engine
      const shapeKey = deriveAcrylicShapeKey(batch.tags[0]?.productType);
      const generator = generateVDPStream(
        batch.tags.map((t) => ({
          productSlug: t.productType || "",
          id: t.id,
          slug: t.slug,
          serialNumber: t.serialNumber || "",
          isCustom: t.isCustom || false,
          name: t.name || "",
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
      where: and(eq(printQueue.batchId, batchId), eq(printQueue.app_id, APP_ID)),
    });

    if (!printQueueItem) {
      return new NextResponse("Batch not found", { status: 404 });
    }

    const batchTags = await db.query.tags.findMany({
      where: and(
        sql`${tags.slug} LIKE ${batchId + "-%"}`,
        eq(tags.app_id, APP_ID),
      ),
      columns: {
        id: true,
        slug: true,
        serialNumber: true,
        isCustom: true,
        name: true,
        productType: true,
      },
      orderBy: (tags, { asc }) => [asc(tags.slug)],
    });

    if (batchTags.length === 0) {
      return new NextResponse("No tags found for this batch", { status: 404 });
    }

    const vdpTags: TagVDPData[] = batchTags.map((tag) => ({
      productSlug: tag.productType || "",
      id: tag.id,
      slug: tag.slug,
      isCustom: false,
      name: tag.name || "",
      serialNumber: tag.serialNumber || "",
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

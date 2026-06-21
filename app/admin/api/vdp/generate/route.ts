import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue, printBatches } from "@/db/schema";
import { randomUUID } from "crypto";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";
import { eq, asc } from "drizzle-orm";
import { generateVDPStream, generateBatchActivationData, type TagVDPData } from "@/lib/vdp-engine";
import JSZip from "jszip";
import { calculateGridPositions, type StickerShape, type StickerSize } from "@/lib/sticker-template";
import { put } from '@vercel/blob';

export const dynamic = "force-dynamic";

interface VDPGenerateRequest {
  batchName: string;
  quantity: number;
  materialType: "sticker" | "acrylic" | "acrylic-cutfold";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a4" | "a3";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  adminId: string;
  isCustom: boolean; // Custom photo order flag
  customPhotoData?: string; // Base64 encoded photo data
  singleTag?: {
    slug: string;
    name: string;
    contactWhatsapp: string | null;
    customMessage: string | null;
    rewardNote: string | null;
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

// GET - Fetch tags with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = await request.nextUrl;
    const filter = searchParams.get("filter") || "all";

    let whereClause;
    if (filter === "claimed") {
      whereClause = tags.ownerId !== null;
    } else if (filter === "unclaimed") {
      whereClause = tags.ownerId === null;
    } else {
      whereClause = undefined;
    }

    const allTags = await db.query.tags.findMany({
      where: whereClause,
      orderBy: [asc(tags.slug)],
    });

    const total = allTags.length;
    const claimed = allTags.filter(t => t.ownerId !== null).length;
    const unclaimed = total - claimed;

    return NextResponse.json({
      tags: allTags,
      stats: { total, claimed, unclaimed },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

// DELETE - Delete an unclaimed tag
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = await request.nextUrl;
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json({ error: "Missing tagId parameter" }, { status: 400 });
    }

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, tagId),
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    if (tag.ownerId !== null) {
      return NextResponse.json({ error: "Cannot delete claimed tags" }, { status: 400 });
    }

    await db.delete(tags).where(eq(tags.id, tagId));

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
      action: "delete_tag",
      entityType: "tag",
      entityId: tagId,
      originalValue: { name: tag.name, slug: tag.slug },
      newValue: null,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}

// POST - Generate new tags batch with 6-COLUMN VDP output
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchName, quantity, materialType, productType, paperSize, stickerShape, stickerSize, adminId, isCustom, customPhotoData, singleTag }: VDPGenerateRequest = body;

    if (!batchName || !quantity || !materialType || !productType || !paperSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json({ error: "Quantity must be between 1 and 1000" }, { status: 400 });
    }

    // Validate custom order requirements
    if (isCustom && !customPhotoData) {
      return NextResponse.json({ error: "Custom photo data is required for custom orders" }, { status: 400 });
    }

    const batchId = randomUUID();
    const isCutFold = materialType === "acrylic-cutfold";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://balikin.id";
    const generatedTags: any[] = [];

    // Upload custom photo to Vercel Blob if provided
    let customPhotoUrl: string | null = null;
    if (isCustom && customPhotoData) {
      try {
        // Check if BLOB_READ_WRITE_TOKEN is available
        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

        if (blobToken) {
          // Convert base64 to buffer
          const base64Data = customPhotoData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to Vercel Blob
          const blob = await put(`custom-photos/${batchId}.png`, buffer, {
            access: 'public',
          });
          customPhotoUrl = blob.url;
        } else {
          // Fallback: Store base64 data directly (temporary solution)
          // This will be stored in the database as customPhotoUrl
          // WARNING: Not recommended for production, only for development
          console.warn('BLOB_READ_WRITE_TOKEN not set. Using base64 fallback for custom photo.');
          customPhotoUrl = customPhotoData; // Store base64 directly
        }
      } catch (error) {
        console.error('Error uploading custom photo:', error);
        return NextResponse.json({ error: "Failed to upload custom photo" }, { status: 500 });
      }
    }

    // STEP 1: Create printBatches entry first (for 6-column VDP)
    let batchNumber: string | null = null;
    if (!isCutFold) {
      // Generate batch number like "B01-001"
      const countResult = await db.query.printBatches.findMany({
        where: eq(printBatches.app_id, "balikin_id"),
        columns: { batchNumber: true },
        orderBy: (printBatches, { desc }) => [desc(printBatches.createdAt)],
        limit: 1,
      });

      const lastBatchNum = countResult[0]?.batchNumber || "B00-000";
      const numPart = parseInt(lastBatchNum.split("-")[1]) + 1;
      batchNumber = `B01-${String(numPart).padStart(3, "0")}`;

      await db.insert(printBatches).values({
        id: batchId,
        app_id: "balikin_id",
        batchNumber,
        serialNumberRange: `${batchNumber}-001 to ${batchNumber}-${String(quantity).padStart(3, "0")}`,
        totalStickers: quantity,
        status: "pending",
        createdBy: adminId,
      });
    }

    // Generate activation data for all tags
    const activationData = generateBatchActivationData(quantity, batchNumber || batchId);

    // DEBUG: Log activation data
    console.log('[API] Generated activationData for first tag:', activationData[0]);
    console.log('[API] activationTokenHash:', activationData[0].activationTokenHash);
    console.log('[API] activationPinPlain:', activationData[0].activationPinPlain);

    // CHUNKING: Ambil data per 2 tag (chunk size = 2)
    for (let i = 0; i < quantity; i += 2) {
      const tagA_Index = i;
      const tagB_Index = i + 1;
      const sequenceNumberA = String(tagA_Index + 1).padStart(3, "0");
      const slugA = `${batchId}-${sequenceNumberA}`;

      const tier = materialType === "acrylic" ? "premium" : "free";

      // Create Tag A
      const tagA = {
        id: randomUUID(),
        app_id: "balikin_id",
        slug: slugA,
        ownerId: null,
        name: `${batchName} ${sequenceNumberA}`,
        status: "normal",
        tier,
        productType: materialType,
        bundleId: null,
        bundleType: productType !== "standard" ? productType : null,
        autoActivateModule: productType !== "standard" ? productType : null,
        isVerified: false,
        emailAlertsEnabled: true,
        whatsappAlertsEnabled: false,
        hasTabTwoEnabled: productType !== "standard",
        welcomeShown: false,
        onboardingCompleted: false,
        // Activation data
        serialNumber: activationData[tagA_Index].serialNumber,
        activationPinPlain: activationData[tagA_Index].activationPinPlain,
        activationPinHash: activationData[tagA_Index].activationPinHash,
        activationTokenHash: activationData[tagA_Index].activationTokenHash,
        batchId: isCutFold ? null : batchId, // Link to printBatches for VDP
        // Custom order data
        isCustom: isCustom || false,
        customPhotoUrl: isCustom ? customPhotoUrl : null,
      };

      await db.insert(tags).values(tagA);

      generatedTags.push({
        slug: slugA,
        sequenceNumber: sequenceNumberA,
        filename: `${batchName}-${sequenceNumberA}-${slugA}.png`,
      });

      // Create Tag B jika ada (pair lengkap)
      if (tagB_Index < quantity) {
        const sequenceNumberB = String(tagB_Index + 1).padStart(3, "0");
        const slugB = `${batchId}-${sequenceNumberB}`;

        const tagB = {
          id: randomUUID(),
          app_id: "balikin_id",
          slug: slugB,
          ownerId: null,
          name: `${batchName} ${sequenceNumberB}`,
          status: "normal",
          tier,
          productType: materialType,
          bundleId: null,
          bundleType: productType !== "standard" ? productType : null,
          autoActivateModule: productType !== "standard" ? productType : null,
          isVerified: false,
          emailAlertsEnabled: true,
          whatsappAlertsEnabled: false,
          hasTabTwoEnabled: productType !== "standard",
          welcomeShown: false,
          onboardingCompleted: false,
          // Activation data
          serialNumber: activationData[tagB_Index].serialNumber,
          activationPinPlain: activationData[tagB_Index].activationPinPlain,
          activationPinHash: activationData[tagB_Index].activationPinHash,
          activationTokenHash: activationData[tagB_Index].activationTokenHash,
          batchId: isCutFold ? null : batchId, // Link to printBatches for VDP
          // Custom order data
          isCustom: isCustom || false,
          customPhotoUrl: isCustom ? customPhotoUrl : null,
        };

        await db.insert(tags).values(tagB);

        generatedTags.push({
          slug: slugB,
          sequenceNumber: sequenceNumberB,
          filename: `${batchName}-${sequenceNumberB}-${slugB}.png`,
        });
      }
    }

    let downloadUrl: string;

    console.log('[API] isCutFold:', isCutFold);
    console.log('[API] materialType:', materialType);

    if (isCutFold) {
      // Cut & Fold tetap pakai PDF
      console.log('[API] Using Cut & Fold path');
      downloadUrl = `/admin/api/vdp/cut-fold/${batchId}?paperSize=${paperSize}`;
    } else {
      // BARU: Gunakan VDP Stream untuk generate 6-kolom PNG
      console.log('[API] Using VDP Stream path');
      // Fetch all tags yang baru dibuat using batchId
      const allTags = await db.query.tags.findMany({
        where: eq(tags.batchId, batchId),
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          activationPinPlain: true,
          activationTokenHash: true,
          isCustom: true,
          customPhotoUrl: true,
          name: true,
        },
        orderBy: [asc(tags.slug)],
      });

      // Generate ZIP berisi PNG rows (6 kolom per row)
      const zip = new JSZip();
      const vdpTags: TagVDPData[] = allTags.map((t) => ({
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || undefined,
        activationPinPlain: t.activationPinPlain || undefined,
        activationTokenHash: t.activationTokenHash || undefined,
        isCustom: t.isCustom || false,
        customPhotoUrl: t.customPhotoUrl || undefined,
        name: t.name,
      }));

      console.log('[API] Fetched', allTags.length, 'tags from database');
      console.log('[API] First tag activationTokenHash:', allTags[0]?.activationTokenHash);
      console.log('[API] First tag isCustom:', allTags[0]?.isCustom);
      console.log('[API] First vdpTag activationTokenHash:', vdpTags[0]?.activationTokenHash);

      // Generate rows dan tambahkan ke ZIP
      console.log('[API] Starting VDP stream generation...');
      console.log('[API] Total tags for VDP:', vdpTags.length);
      console.log('[API] First vdpTag:', JSON.stringify({
        slug: vdpTags[0]?.slug,
        activationTokenHash: vdpTags[0]?.activationTokenHash ? 'PRESENT' : 'MISSING',
        isCustom: vdpTags[0]?.isCustom,
      }));

      let rowIndex = 0;
      for await (const buffer of generateVDPStream(vdpTags)) {
        const filename = `${batchName}-row-${String(rowIndex + 1).padStart(3, "0")}.png`;
        zip.file(filename, buffer);
        console.log('[API] Generated row', rowIndex, 'buffer size:', buffer.length, 'bytes');
        rowIndex++;
      }

      console.log('[API] Total rows generated:', rowIndex);
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const zipBase64 = zipBuffer.toString("base64");
      downloadUrl = `data:application/zip;base64,${zipBase64}`;
      console.log('[API] ZIP base64 length:', zipBase64.length);
      console.log('[API] Response downloadUrl type:', downloadUrl.substring(0, 50) + '...');
    }

    // Calculate items per sheet
    const shape: StickerShape = (stickerShape as StickerShape) || "circle";
    const size: StickerSize = (stickerSize as StickerSize) || "medium";
    const gridPositions = calculateGridPositions(shape, size, paperSize, "landscape");
    const itemsPerSheet = gridPositions.length;
    const estimatedSheets = Math.ceil(quantity / itemsPerSheet);

    await db.insert(printQueue).values({
      id: randomUUID(),
      app_id: "balikin_id",
      batchId,
      batchName,
      status: "pending",
      itemCount: quantity,
      materialType: isCutFold ? "acrylic" : materialType,
      materialUsed: `${estimatedSheets} lembar ${paperSize.toUpperCase()} (${isCutFold ? "Cut & Fold" : "6-Column VDP"})`,
      printedBy: adminId,
    });

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "generate_batch",
      entityType: "batch",
      entityId: batchId,
      originalValue: null,
      newValue: {
        batchName,
        quantity,
        materialType,
        productType,
        paperSize,
        stickerShape,
        stickerSize,
      },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      batchId,
      batchName,
      quantity,
      tags: generatedTags,
      downloadUrl,
      vdpMode: isCutFold ? "cut-fold" : "6-column",
    });
  } catch (error) {
    console.error("Error generating batch:", error);
    return NextResponse.json({ error: "Failed to generate batch" }, { status: 500 });
  }
}

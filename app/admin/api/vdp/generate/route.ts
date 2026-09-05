import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue, printBatches, stickerSheets } from "@/db/schema";
import { randomUUID } from "crypto";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";
import { eq, asc } from "drizzle-orm";
import { generateVDPStream, generateBatchActivationData, type TagVDPData } from "@/lib/vdp-engine";
import { deriveAcrylicShapeKey } from "@/lib/acrylic-shapes";
import { generateA5StickerStream } from "@/lib/vdp-a5-sticker";
import { generateA5TwoColStickerStream } from "@/lib/vdp-a5-sticker-twocol";
import { generateProtectedCardStream, generateFamilyCardStream } from "@/lib/vdp-sticker-pro";
import { buildStickerSheetsPdf } from "@/lib/vdp-pdf-export";
import { buildAcrylicRowsPdf } from "@/lib/vdp-acrylic-pdf";
import JSZip from "jszip";
import { calculateGridPositions, calculateA5StickerPositions, getStickerProductConfig, type StickerShape, type StickerSize, type StickerProductKey } from "@/lib/sticker-template";
import { hashValue, generateActivationPin } from "@/lib/crypto";
import { put } from '@vercel/blob';
import { normalizeStickerColorTheme } from '@/lib/sticker-color-themes';

// Master PIN sheet code prefix per Sticker Product (see md for development/sticker_activate.md)
const STICKER_PRODUCT_CODE: Record<string, string> = {
  'stiker-pro': 'PRO',
  'stiker-daily': 'DLY',
  'stiker-micro': 'MIC',
  'stiker-family': 'FAM',
};

export const dynamic = "force-dynamic";

interface VDPGenerateRequest {
  batchName: string;
  quantity: number;
  materialType: "sticker" | "acrylic-oval" | "acrylic-octagon" | "acrylic-heart" | "acrylic-rectangle" | "acrylic-rectangle-motif" | "acrylic-square" | "acrylic-circle" | "acrylic-rectangle-emboss";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a4" | "a3" | "a5";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  stickerProductKey?: StickerProductKey;
  stickerColorTheme?: string;
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
    const { batchName, quantity, materialType, productType, paperSize, stickerShape, stickerSize, stickerProductKey, stickerColorTheme, adminId, isCustom, customPhotoData, singleTag }: VDPGenerateRequest = body;

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
    const isAcrylicMaterial = materialType !== "sticker";
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

    // STEP 1: Create printBatches entry first (for 4-column acrylic VDP)
    let batchNumber: string | null = null;
    // Generate batch number like "B01-001" for all non-sticker materials
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

    const isStickerMaterial = materialType === "sticker";

    if (isStickerMaterial) {
      // Master Activation Key (Lazy Activation) - see "md for development/sticker_activate.md"
      // One physical sheet shares a single Master PIN instead of a PIN per individual QR tag.
      const isA5StickerSheet = paperSize === "a5" && !!stickerProductKey;
      const stickerItemsPerSheet = isA5StickerSheet
        ? getStickerProductConfig(stickerProductKey as StickerProductKey).total
        : calculateGridPositions(
            (stickerShape as StickerShape) || "circle",
            (stickerSize as StickerSize) || "medium",
            paperSize as "a4" | "a3",
            "landscape"
          ).length;
      const productCode = stickerProductKey ? (STICKER_PRODUCT_CODE[stickerProductKey] || "STK") : "STK";

      let sheetSequence = 0;
      let tagSequence = 0;

      for (let sheetStart = 0; sheetStart < quantity; sheetStart += stickerItemsPerSheet) {
        sheetSequence++;
        const sheetTagCount = Math.min(stickerItemsPerSheet, quantity - sheetStart);
        const sheetId = randomUUID();
        const sheetCode = `BLK-${productCode}-${batchNumber || "B00-000"}-${String(sheetSequence).padStart(4, "0")}`;
        const masterPin = generateActivationPin();

        await db.insert(stickerSheets).values({
          id: sheetId,
          app_id: "balikin_id",
          sheetCode,
          packageType: stickerProductKey || "custom",
          batchId,
          activationPinHash: hashValue(masterPin),
          activationPinPlain: masterPin,
          status: "inactive",
          ownerId: null,
        });

        for (let j = 0; j < sheetTagCount; j++) {
          tagSequence++;
          const sequenceNumber = String(tagSequence).padStart(3, "0");
          const slug = `${batchId}-${sequenceNumber}`;

          const tag = {
            id: randomUUID(),
            app_id: "balikin_id",
            slug,
            ownerId: null,
            name: `${batchName} ${sequenceNumber}`,
            status: "normal",
            tier: "free",
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
            // Physical QC code, derived from the sheet (no per-tag PIN under the sheet model)
            serialNumber: `${sheetCode}-${String(j + 1).padStart(2, "0")}`,
            activationPinPlain: null,
            activationPinHash: null,
            activationTokenHash: null,
            batchId,
            sheetId,
            // Custom order data
            isCustom: isCustom || false,
            customPhotoUrl: isCustom ? customPhotoUrl : null,
          };

          await db.insert(tags).values(tag);

          generatedTags.push({
            slug,
            sequenceNumber,
            filename: `${batchName}-${sequenceNumber}-${slug}.png`,
          });
        }
      }
    } else {
      // Existing per-tag PIN model (acrylic / acrylic-cutfold)
      const activationData = generateBatchActivationData(quantity, batchNumber || batchId);

      // CHUNKING: Ambil data per 2 tag (chunk size = 2)
      for (let i = 0; i < quantity; i += 2) {
        const tagA_Index = i;
        const tagB_Index = i + 1;
        const sequenceNumberA = String(tagA_Index + 1).padStart(3, "0");
        const slugA = `${batchId}-${sequenceNumberA}`;

        const tier = isAcrylicMaterial ? "premium" : "free";

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
          batchId, // Link to printBatches for VDP
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
            batchId, // Link to printBatches for VDP
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
    }

    let downloadUrl: string;
    let downloadFormat: "pdf" | "zip" = "zip";

    console.log('[API] isAcrylicMaterial:', isAcrylicMaterial);
    console.log('[API] materialType:', materialType);
    console.log('[API] paperSize:', paperSize);
    console.log('[API] stickerProductKey:', stickerProductKey);

    const isA5Sticker = materialType === "sticker" && paperSize === "a5" && stickerProductKey;

    if (isA5Sticker) {
      // A5 Sticker: Generate sticker sheets
      console.log('[API] Using A5 Sticker path with product:', stickerProductKey);
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

      const a5Tags = allTags.map((t) => ({
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || undefined,
        activationPinPlain: t.activationPinPlain || undefined,
        activationTokenHash: t.activationTokenHash || undefined,
        isCustom: t.isCustom || false,
        customPhotoUrl: t.customPhotoUrl || undefined,
        name: t.name,
      }));

      console.log('[API] Generating', allTags.length, 'A5 sticker sheets for product:', stickerProductKey);
      const selectedColorTheme = normalizeStickerColorTheme(stickerColorTheme);

      const stickerSheetStream = stickerProductKey === "stiker-pro" || stickerProductKey === "stiker-daily" || stickerProductKey === "stiker-micro"
        ? generateProtectedCardStream(a5Tags, stickerProductKey, selectedColorTheme)
        : stickerProductKey === "stiker-family"
          ? generateFamilyCardStream(a5Tags, selectedColorTheme)
          : generateA5TwoColStickerStream(a5Tags, stickerProductKey as StickerProductKey);

      const sheetBuffers: Buffer[] = [];
      for await (const buffer of stickerSheetStream) {
        console.log('[API] Generated A5 sheet', sheetBuffers.length, 'buffer size:', buffer.length, 'bytes');
        sheetBuffers.push(buffer);
      }

      console.log('[API] Total A5 sheets generated:', sheetBuffers.length);

      const pdfBuffer = await buildStickerSheetsPdf(sheetBuffers);

      const zip = new JSZip();
      zip.file(`${batchName}.pdf`, pdfBuffer);

      if (isStickerMaterial) {
        // Master PIN manifest for printing the physical PIN insert per sheet
        const sheets = await db.query.stickerSheets.findMany({
          where: eq(stickerSheets.batchId, batchId),
          orderBy: [asc(stickerSheets.sheetCode)],
        });
        const manifestLines = [
          `Master PIN Manifest - ${batchName}`,
          `Dibuat: ${new Date().toISOString()}`,
          '',
          'Satu Master PIN berlaku untuk seluruh QR dalam 1 lembar.',
          'Scan QR pertama di lembar = masukkan PIN untuk aktivasi. Scan QR berikutnya di lembar yang sama tidak perlu PIN lagi.',
          '',
          ...sheets.map((s) => `${s.sheetCode}\tPIN: ${s.activationPinPlain}`),
        ];
        zip.file('master-pins.txt', manifestLines.join('\n'));
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const zipBase64 = zipBuffer.toString("base64");
      downloadUrl = `data:application/zip;base64,${zipBase64}`;
      console.log('[API] ZIP base64 length:', zipBase64.length);
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

      const shapeKey = deriveAcrylicShapeKey(materialType);

      const rowBuffers: Buffer[] = [];
      for await (const buffer of generateVDPStream(vdpTags, shapeKey)) {
        console.log('[API] Generated row', rowBuffers.length, 'buffer size:', buffer.length, 'bytes');
        rowBuffers.push(buffer);
      }

      console.log('[API] Total rows generated:', rowBuffers.length);
      const pdfBuffer = await buildAcrylicRowsPdf(rowBuffers, paperSize as "a3" | "a4" | "a5");
      const pdfBase64 = pdfBuffer.toString("base64");
      downloadUrl = `data:application/pdf;base64,${pdfBase64}`;
      downloadFormat = "pdf";
      console.log('[API] PDF base64 length:', pdfBase64.length);
    }

    // Calculate items per sheet
    let itemsPerSheet = 12;
    let estimatedSheets = 1;

    if (isA5Sticker && stickerProductKey) {
      // A5 Stickers
      const config = getStickerProductConfig(stickerProductKey as StickerProductKey);
      itemsPerSheet = config.total;
      estimatedSheets = Math.ceil(quantity / itemsPerSheet);
    } else {
      // 4-column acrylic VDP (2 paket x QR Utama + Logo/Foto)
      const shape: StickerShape = (stickerShape as StickerShape) || "circle";
      const size: StickerSize = (stickerSize as StickerSize) || "medium";
      const gridPositions = calculateGridPositions(shape, size, paperSize as "a4" | "a3", "landscape");
      itemsPerSheet = gridPositions.length;
      estimatedSheets = Math.ceil(quantity / itemsPerSheet);
    }

    const vdpMode = isA5Sticker ? "a5-sticker" : "4-column";
    const materialUsed = isA5Sticker
      ? `${estimatedSheets} lembar A5 (A5 Sticker - ${stickerProductKey})`
      : `${estimatedSheets} lembar ${paperSize.toUpperCase()} (4-Column VDP)`;

    await db.insert(printQueue).values({
      id: randomUUID(),
      app_id: "balikin_id",
      batchId,
      batchName,
      status: "pending",
      itemCount: quantity,
      materialType,
      materialUsed,
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
        stickerProductKey,
        vdpMode,
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
      downloadFormat,
      vdpMode,
      estimatedSheets,
      itemsPerSheet,
    });
  } catch (error) {
    console.error("Error generating batch:", error);
    return NextResponse.json({ error: "Failed to generate batch" }, { status: 500 });
  }
}

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue, printBatches, stickerSheets, stickerOrders, tagBundles } from "@/db/schema";
import { randomUUID } from "crypto";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";
import { eq, asc, and, isNull, isNotNull } from "drizzle-orm";
import { generateVDPStream, generateBatchActivationData, type TagVDPData } from "@/lib/vdp-engine";
import { deriveAcrylicShapeKey, getAcrylicPairsPerRow } from "@/lib/acrylic-shapes";
import { generateA5StickerStream } from "@/lib/vdp-a5-sticker";
import { generateA5TwoColStickerStream } from "@/lib/vdp-a5-sticker-twocol";
import { generateProtectedCardStream, generateFamilyCardStream } from "@/lib/vdp-sticker-pro";
import { buildStickerSheetsPdf } from "@/lib/vdp-pdf-export";
import { buildAcrylicRowsPdf } from "@/lib/vdp-acrylic-pdf";
import JSZip from "jszip";
import QRCode from 'qrcode';
import { calculateGridPositions, calculateA5StickerPositions, getStickerProductConfig, type StickerShape, type StickerSize, type StickerProductKey } from "@/lib/sticker-template";
import { hashValue, generateActivationPin } from "@/lib/crypto";
import { uploadR2Object, r2Configured } from '@/lib/r2-storage';
import { normalizeStickerColorTheme } from '@/lib/sticker-color-themes';
import { getAppBaseUrl } from '@/lib/app-url';
import { getDefaultDivision, hasPermission } from '@/lib/admin-divisions';
import { buildActivationCardsPdf, buildBalikinManualPdf, type ActivationCardData } from '@/lib/vdp-manual-pdf';

// Master PIN sheet code prefix per Sticker Product (see md for development/sticker_activate.md)
const STICKER_PRODUCT_CODE: Record<string, string> = {
  'stiker-pro': 'PRO',
  'stiker-daily': 'DLY',
  'stiker-micro': 'MIC',
  'stiker-family': 'FAM',
};

const STICKER_PRODUCT_KEYS = ['stiker-pro', 'stiker-daily', 'stiker-micro', 'stiker-family'] as const;

function isStickerProductKey(value: string | null | undefined): value is StickerProductKey {
  return value !== null && value !== undefined && STICKER_PRODUCT_KEYS.includes(value as StickerProductKey);
}

interface GeneratedTag {
  slug: string;
  sequenceNumber: string;
  filename: string;
}

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

interface VDPGenerateRequest {
  orderId?: string;
  batchName: string;
  quantity: number;
  materialType: "sticker" | "acrylic-oval" | "acrylic-octagon" | "acrylic-heart" | "acrylic-rectangle" | "acrylic-rectangle-motif" | "acrylic-square" | "acrylic-circle" | "acrylic-rectangle-emboss";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a4" | "a3" | "a5";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  stickerProductKey?: StickerProductKey;
  stickerColorTheme?: string;
  adminId?: string;
  isCustom: boolean; // Custom photo order flag
  customPhotoData?: string; // Base64 encoded photo data
  outputFormat?: "pdf" | "png"; // Pilihan file hasil akrilik: PDF (cetak) atau PNG (per-baris, ZIP)
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
    if (!hasPermission(session.user.division || getDefaultDivision(), "vdp_tool")) {
      return NextResponse.json({ error: "Akses VDP hanya tersedia untuk divisi Produksi atau Administrator." }, { status: 403 });
    }

    const { searchParams } = await request.nextUrl;
    const filter = searchParams.get("filter") || "all";

    let whereClause;
    if (filter === "claimed") {
      whereClause = and(eq(tags.app_id, APP_ID), isNotNull(tags.ownerId));
    } else if (filter === "unclaimed") {
      whereClause = and(eq(tags.app_id, APP_ID), isNull(tags.ownerId));
    } else {
      whereClause = eq(tags.app_id, APP_ID);
    }

    const allTags = await db.query.tags.findMany({
      where: whereClause,
      columns: {
        id: true,
        slug: true,
        name: true,
        ownerId: true,
        contactWhatsapp: true,
        customMessage: true,
        rewardNote: true,
        status: true,
        tier: true,
        productType: true,
        bundleType: true,
        createdAt: true,
      },
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
    if (!hasPermission(session.user.division || getDefaultDivision(), "vdp_tool")) {
      return NextResponse.json({ error: "Akses VDP hanya tersedia untuk divisi Produksi atau Administrator." }, { status: 403 });
    }

    const { searchParams } = await request.nextUrl;
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json({ error: "Missing tagId parameter" }, { status: 400 });
    }

    const tag = await db.query.tags.findFirst({
      where: and(eq(tags.id, tagId), eq(tags.app_id, APP_ID)),
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    if (tag.ownerId !== null) {
      return NextResponse.json({ error: "Cannot delete claimed tags" }, { status: 400 });
    }

    await db.delete(tags).where(and(eq(tags.id, tagId), eq(tags.app_id, APP_ID)));

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
    if (!hasPermission(session.user.division || getDefaultDivision(), "vdp_tool")) {
      return NextResponse.json({ error: "Akses VDP hanya tersedia untuk divisi Produksi atau Administrator." }, { status: 403 });
    }

    const body = await request.json();
    const { orderId } = body as VDPGenerateRequest;
    let { batchName, quantity, materialType, productType, paperSize, stickerShape, stickerSize, stickerProductKey, stickerColorTheme, isCustom, customPhotoData, singleTag, outputFormat } = body as VDPGenerateRequest;
    const adminId = session.user.id;

    const order = orderId
      ? await db.query.stickerOrders.findFirst({
          where: and(eq(stickerOrders.id, orderId), eq(stickerOrders.app_id, "balikin_id")),
          with: {
            bundles: {
              where: eq(tagBundles.app_id, APP_ID),
              columns: { id: true },
            },
          },
        })
      : null;

    if (orderId && !order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    if (orderId && order) {
      if (order.paymentStatus !== "paid") {
        return NextResponse.json({ error: "Order belum diverifikasi pembayarannya" }, { status: 400 });
      }
      if (order.bundles.length > 0) {
        return NextResponse.json({ error: "Bundle VDP sudah dibuat untuk order ini" }, { status: 409 });
      }

      batchName = batchName || `Order-${order.id.slice(0, 8)}`;
      quantity = order.packQuantity * order.unitCountPerPack;
      productType = "standard";
      isCustom = false;
      customPhotoData = undefined;
      outputFormat = "pdf";

      if (order.productType === "sticker") {
        const fallbackProductKey = order.unitCountPerPack === 4
          ? "stiker-pro"
          : order.unitCountPerPack === 5
            ? "stiker-daily"
            : order.unitCountPerPack === 8
              ? "stiker-micro"
              : "stiker-family";
        materialType = "sticker";
        paperSize = "a5";
        stickerShape = stickerShape || "circle";
        stickerSize = stickerSize || "medium";
        stickerProductKey = stickerProductKey || (isStickerProductKey(order.productVariant) ? order.productVariant : undefined) || fallbackProductKey;
        stickerColorTheme = order.stickerColorTheme || stickerColorTheme;
      } else if (order.productType === "acrylic") {
        const acrylicVariant = order.productVariant?.replace(/^acrylic-/, '') || "rectangle-emboss";
        materialType = `acrylic-${acrylicVariant}` as VDPGenerateRequest["materialType"];
        paperSize = "a3";
        stickerProductKey = undefined;
      } else {
        return NextResponse.json({ error: "Tipe produk order ini belum didukung oleh VDP" }, { status: 400 });
      }
    }

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
    const baseUrl = getAppBaseUrl();
    const generatedTags: GeneratedTag[] = [];

    // Upload custom photo to Vercel Blob if provided
    let customPhotoUrl: string | null = null;
    if (isCustom && customPhotoData) {
      try {
        if (r2Configured()) {
          // Convert base64 to buffer
          const base64Data = customPhotoData.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          const blob = await uploadR2Object({
            key: `custom-photos/${batchId}.png`,
            body: buffer,
            contentType: 'image/png',
          });
          customPhotoUrl = blob.url;
        } else {
          // Fallback: Store base64 data directly (temporary solution)
          // This will be stored in the database as customPhotoUrl
          // WARNING: Not recommended for production, only for development
          console.warn('R2 not set. Using base64 fallback for custom photo.');
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

    let linkedBundleId: string | null = null;
    if (order) {
      const [bundle] = await db.insert(tagBundles).values({
        app_id: APP_ID,
        orderId: order.id,
        productType: order?.productType || materialType,
        itemCount: quantity,
        status: "ready_for_fulfillment",
        stickerShape: stickerShape || "circle",
        stickerSize: stickerSize || "medium",
      }).returning({ id: tagBundles.id });

      linkedBundleId = bundle.id;
      await db.update(tags)
        .set({ bundleId: bundle.id })
        .where(and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)));
    }

    let downloadUrl: string;
    let downloadFormat: "pdf" | "zip" = "zip";
    let artifactBuffer!: Buffer;
    let artifactContentType!: "application/pdf" | "application/zip";
    let artifactFilename!: string;

    console.log('[API] isAcrylicMaterial:', isAcrylicMaterial);
    console.log('[API] materialType:', materialType);
    console.log('[API] paperSize:', paperSize);
    console.log('[API] stickerProductKey:', stickerProductKey);

    const isA5Sticker = materialType === "sticker" && paperSize === "a5" && !!stickerProductKey;

    if (isA5Sticker) {
      const activeStickerProductKey = stickerProductKey;
      if (!activeStickerProductKey) {
        throw new Error("A5 sticker product key is required");
      }
      // A5 Sticker: Generate sticker sheets
      console.log('[API] Using A5 Sticker path with product:', stickerProductKey);
      const allTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          isCustom: true,
          customPhotoUrl: true,
          name: true,
          productType: true,
        },
        orderBy: [asc(tags.slug)],
      });

      const a5Tags = allTags.map((t) => ({
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || undefined,
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
          : generateA5TwoColStickerStream(a5Tags, activeStickerProductKey);

      const sheetBuffers: Buffer[] = [];
      for await (const buffer of stickerSheetStream) {
        console.log('[API] Generated A5 sheet', sheetBuffers.length, 'buffer size:', buffer.length, 'bytes');
        sheetBuffers.push(buffer);
      }

      console.log('[API] Total A5 sheets generated:', sheetBuffers.length);

      const pdfBuffer = await buildStickerSheetsPdf(sheetBuffers);
      const manualPdf = await buildBalikinManualPdf(`${baseUrl}/help`);

      const zip = new JSZip();
      zip.file(`production/${batchName}.pdf`, pdfBuffer);

      if (isStickerMaterial) {
        // One activation card is generated per sticker sheet because the sheet
        // model intentionally uses one master PIN for all QR codes on that sheet.
        const sheets = await db.query.stickerSheets.findMany({
          where: and(eq(stickerSheets.batchId, batchId), eq(stickerSheets.app_id, APP_ID)),
          columns: { id: true, sheetCode: true, activationPinPlain: true },
          orderBy: [asc(stickerSheets.sheetCode)],
        });
        const sheetTags = await db.query.tags.findMany({
          where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
          columns: { sheetId: true, serialNumber: true },
          orderBy: [asc(tags.serialNumber)],
        });
        const activationCards: ActivationCardData[] = sheets.map((sheet) => ({
          codeLabel: 'PIN MASTER SHEET',
          code: sheet.activationPinPlain || '-',
          scope: `${sheet.sheetCode} · ${sheetTags.filter((tag) => tag.sheetId === sheet.id).length} QR dalam satu sheet`,
          activationUrl: `${baseUrl}/activate/batch/${batchId}`,
        }));
        const manifestLines = [
          `Master PIN Manifest - ${batchName}`,
          `Dibuat: ${new Date().toISOString()}`,
          '',
          'Satu Master PIN berlaku untuk seluruh QR dalam 1 lembar.',
          'Scan QR pertama di lembar = masukkan PIN untuk aktivasi. Scan QR berikutnya di lembar yang sama tidak perlu PIN lagi.',
          '',
          ...sheets.map((s) => `${s.sheetCode}\tPIN: ${s.activationPinPlain}`),
        ];
        zip.file('customer/manual-balikin.pdf', manualPdf);
        zip.file('customer/kartu-aktivasi.pdf', await buildActivationCardsPdf(activationCards));
        zip.file('admin/master-pins.txt', manifestLines.join('\n'));
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      artifactBuffer = zipBuffer;
      artifactContentType = "application/zip";
      artifactFilename = `${batchName}.zip`;
      const zipBase64 = zipBuffer.toString("base64");
      downloadUrl = `data:application/zip;base64,${zipBase64}`;
      console.log('[API] ZIP base64 length:', zipBase64.length);
    } else {
      // BARU: Gunakan VDP Stream untuk generate 6-kolom PNG
      console.log('[API] Using VDP Stream path');
      // Fetch all tags yang baru dibuat using batchId
       const allTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
        columns: {
          id: true,
          slug: true,
          serialNumber: true,
          isCustom: true,
          customPhotoUrl: true,
          name: true,
          productType: true,
          activationPinPlain: true,
        },
        orderBy: [asc(tags.slug)],
      });

      const vdpTags: TagVDPData[] = allTags.map((t) => ({
        productSlug: t.productType || "",
        id: t.id,
        slug: t.slug,
        serialNumber: t.serialNumber || "",
        isCustom: t.isCustom || false,
        customPhotoUrl: t.customPhotoUrl || undefined,
        name: t.name || "",
      }));

      console.log('[API] Fetched', allTags.length, 'tags from database');
      console.log('[API] First tag isCustom:', allTags[0]?.isCustom);

      // Generate rows dan tambahkan ke ZIP
      console.log('[API] Starting VDP stream generation...');
      console.log('[API] Total tags for VDP:', vdpTags.length);
      console.log('[API] First vdpTag:', JSON.stringify({
        slug: vdpTags[0]?.slug,
        isCustom: vdpTags[0]?.isCustom,
      }));

      const shapeKey = deriveAcrylicShapeKey(materialType);
      // A5: 3 pasang/row bila muat skala 1:1 (emboss 180mm ≤ 200mm usable).
      const pairsPerRow = getAcrylicPairsPerRow(shapeKey, paperSize);

      const rowBuffers: Buffer[] = [];
      for await (const buffer of generateVDPStream(vdpTags, shapeKey, { pairsPerRow })) {
        console.log('[API] Generated row', rowBuffers.length, 'buffer size:', buffer.length, 'bytes');
        rowBuffers.push(buffer);
      }

      console.log('[API] Total rows generated:', rowBuffers.length);

      if (outputFormat === "png") {
        // PNG: tiap baris sebagai file PNG dalam ZIP + customer manual/cards + admin manifest
        const zip = new JSZip();
        rowBuffers.forEach((buf, i) => {
          zip.file(`production/${batchName}-baris-${String(i + 1).padStart(2, "0")}.png`, buf);
        });
        const claimTags = await db.query.tags.findMany({
          where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
          columns: { serialNumber: true, slug: true, activationPinPlain: true },
          orderBy: [asc(tags.serialNumber)],
        });
        const pinLines = [
          `PIN Klaim Khusus - ${batchName}`,
          `Dibuat: ${new Date().toISOString()}`,
          '',
          'Satu kode berlaku untuk 1 tag. Scan pertama wajib memasukkan kode ini.',
          '',
          ...claimTags.map((t) => `${t.serialNumber || t.slug}-${t.activationPinPlain || '-'}`),
        ];
        const activationCards: ActivationCardData[] = claimTags.map((tag) => ({
          codeLabel: 'PIN TAG',
          code: tag.activationPinPlain || '-',
          scope: `${tag.serialNumber || tag.slug} · 1 tag`,
          activationUrl: `${baseUrl}/activate/batch/${batchId}`,
        }));
        zip.file('customer/manual-balikin.pdf', await buildBalikinManualPdf(`${baseUrl}/help`));
        zip.file('customer/kartu-aktivasi.pdf', await buildActivationCardsPdf(activationCards));
        zip.file('admin/kode-klaim.txt', pinLines.join('\n'));
        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
        artifactBuffer = zipBuffer;
        artifactContentType = "application/zip";
        artifactFilename = `${batchName}.zip`;
        const zipBase64 = zipBuffer.toString("base64");
        downloadUrl = `data:application/zip;base64,${zipBase64}`;
        downloadFormat = "zip";
        console.log('[API] PNG ZIP base64 length:', zipBase64.length);
      } else {
        const pdfBuffer = await buildAcrylicRowsPdf(rowBuffers, paperSize as "a3" | "a4" | "a5");
        const activationCards: ActivationCardData[] = allTags.map((tag) => ({
          codeLabel: 'PIN TAG',
          code: tag.activationPinPlain || '-',
          scope: `${tag.serialNumber || tag.slug} · 1 tag`,
          activationUrl: `${baseUrl}/activate/batch/${batchId}`,
        }));
        const claimLines = [
          `PIN Klaim Khusus - ${batchName}`,
          `Dibuat: ${new Date().toISOString()}`,
          '',
          'Satu kode berlaku untuk 1 tag.',
          '',
          ...allTags.map((tag) => `${tag.serialNumber || tag.slug}\t${tag.activationPinPlain || '-'}`),
        ];
        const zip = new JSZip();
        zip.file(`production/${batchName}.pdf`, pdfBuffer);
        zip.file('customer/manual-balikin.pdf', await buildBalikinManualPdf(`${baseUrl}/help`));
        zip.file('customer/kartu-aktivasi.pdf', await buildActivationCardsPdf(activationCards));
        zip.file('admin/kode-klaim.txt', claimLines.join('\n'));
        artifactBuffer = await zip.generateAsync({ type: "nodebuffer" });
        artifactContentType = "application/zip";
        artifactFilename = `${batchName}.zip`;
        const zipBase64 = artifactBuffer.toString("base64");
        downloadUrl = `data:application/zip;base64,${zipBase64}`;
        downloadFormat = "zip";
        console.log('[API] Acrylic ZIP base64 length:', zipBase64.length);
      }
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

    const generationConfig = {
      batchName,
      quantity,
      materialType,
      productType,
      paperSize,
      stickerShape,
      stickerSize,
      stickerProductKey,
      stickerColorTheme: stickerColorTheme || undefined,
      isCustom: isCustom || false,
      outputFormat: outputFormat || "pdf",
      generatorVersion: "vdp-2026-09-18-1",
    };

    let artifactUrl: string | null = null;
    let artifactExpiresAt: Date | null = null;
    if (r2Configured()) {
      const artifactKey = `vdp-artifacts/${batchId}/${artifactFilename}`;
      const blob = await uploadR2Object({
        key: artifactKey,
        body: artifactBuffer,
        contentType: artifactContentType,
        privateObject: true,
      });
      artifactUrl = blob.url;
      artifactExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      console.warn("R2 not set; VDP artifact will not be archived.");
    }

    await db.update(printBatches)
      .set({
        artifactUrl,
        artifactFilename,
        artifactContentType,
        artifactSize: artifactBuffer.length,
        artifactExpiresAt,
        generationConfig,
      })
      .where(and(eq(printBatches.id, batchId), eq(printBatches.app_id, APP_ID)));

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

    if (order) {
      await db.update(stickerOrders)
        .set({ status: "in_production", updatedAt: new Date() })
        .where(eq(stickerOrders.id, order.id));
    }

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

    const activationUrl = `${getAppBaseUrl()}/activate/batch/${batchId}`;
    const activationQrDataUrl = await QRCode.toDataURL(activationUrl, { width: 640, margin: 2 });
    const claimManifestLines = [
      `Balikin - Kode Klaim ${batchName}`,
      `QR aktivasi: ${activationUrl}`,
      'Masukkan satu kode untuk mengaktifkan seluruh tag dalam satu paket.',
      '',
      materialType === 'sticker'
        ? 'Kode Paket\tNomor Seri Tag\tKode Klaim'
        : 'Nomor Seri\tKode Klaim',
    ];

    if (materialType === 'sticker') {
      const sheets = await db.query.stickerSheets.findMany({
        where: and(eq(stickerSheets.batchId, batchId), eq(stickerSheets.app_id, APP_ID)),
        columns: { id: true, sheetCode: true, activationPinPlain: true },
        orderBy: [asc(stickerSheets.sheetCode)],
      });
      const sheetTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
        columns: { sheetId: true, serialNumber: true },
        orderBy: [asc(tags.serialNumber)],
      });
      for (const sheet of sheets) {
        const serials = sheetTags.filter((tag) => tag.sheetId === sheet.id).map((tag) => tag.serialNumber).filter(Boolean);
        claimManifestLines.push(`${sheet.sheetCode}\t${serials.join(', ')}\t${sheet.activationPinPlain || '-'}`);
      }
    } else {
      const claimTags = await db.query.tags.findMany({
        where: and(eq(tags.batchId, batchId), eq(tags.app_id, APP_ID)),
        columns: { serialNumber: true, activationPinPlain: true },
        orderBy: [asc(tags.serialNumber)],
      });
      for (const tag of claimTags) {
        claimManifestLines.push(`${tag.serialNumber || '-'}\t${tag.activationPinPlain || '-'}`);
      }
    }

    return NextResponse.json({
      success: true,
      batchId,
      orderId: order?.id || null,
      bundleId: linkedBundleId,
      batchName,
      quantity,
      tags: generatedTags,
      downloadUrl,
      downloadFormat,
      vdpMode,
      estimatedSheets,
      itemsPerSheet,
      activationUrl,
      activationQrDataUrl,
      claimCodeManifest: claimManifestLines.join('\n'),
    });
  } catch (error) {
    console.error("Error generating batch:", error);
    return NextResponse.json({ error: "Failed to generate batch" }, { status: 500 });
  }
}

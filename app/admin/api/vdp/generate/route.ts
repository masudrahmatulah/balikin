import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue } from "@/db/schema";
import { randomUUID } from "crypto";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";
import QRCode from "qrcode";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

interface VDPGenerateRequest {
  batchName: string;
  quantity: number;
  materialType: "sticker" | "acrylic";
  productType: "standard" | "student_kit" | "otomotif" | "pertanian" | "diklat";
  paperSize: "a4" | "a3";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  adminId: string;
  singleTag?: {
    slug: string;
    name: string;
    contactWhatsapp: string | null;
    customMessage: string | null;
    rewardNote: string | null;
  };
}

// GET - Fetch tags with optional filtering by claimed status
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = await request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all"; // "all", "claimed", "unclaimed"

    let whereClause;
    if (filter === "claimed") {
      whereClause = isNotNull(tags.ownerId);
    } else if (filter === "unclaimed") {
      whereClause = isNull(tags.ownerId);
    } else {
      whereClause = undefined;
    }

    const allTags = await db.query.tags.findMany({
      where: whereClause,
      orderBy: [desc(tags.createdAt)],
    });

    // Calculate stats
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

    const searchParams = await request.nextUrl.searchParams;
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

// POST - Generate new tags batch with ZIP download
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchName, quantity, materialType, productType, paperSize, stickerShape, stickerSize, adminId, singleTag }: VDPGenerateRequest = body;

    if (!batchName || !quantity || !materialType || !productType || !paperSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json({ error: "Quantity must be between 1 and 1000" }, { status: 400 });
    }

    const batchId = randomUUID();
    const zip = new JSZip();
    const generatedTags = [];

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://balikin.id";

    // Single tag creation with custom fields
    if (singleTag && quantity === 1) {
      const tagId = randomUUID();
      const slug = singleTag.slug;

      const newTag = {
        id: tagId,
        app_id: "balikin_id",
        slug,
        ownerId: null,
        name: singleTag.name,
        status: "normal",
        tier: "premium",
        productType: "acrylic",
        bundleId: null,
        contactWhatsapp: singleTag.contactWhatsapp,
        customMessage: singleTag.customMessage,
        rewardNote: singleTag.rewardNote,
        isVerified: false,
        emailAlertsEnabled: false,
        whatsappAlertsEnabled: true,
      };

      await db.insert(tags).values(newTag);

      generatedTags.push({
        slug,
        sequenceNumber: "001",
        filename: `${singleTag.name}-${slug}.png`,
      });

      const qrUrl = `${baseUrl}/p/${slug}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 600,
        margin: 4,
        color: { dark: "#000000", light: "#ffffff" },
      });

      const base64Data = qrDataUrl.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      zip.file(`${singleTag.name}-${slug}.png`, buffer);
    } else {
      // Bulk tag creation
      for (let i = 0; i < quantity; i++) {
        const tagId = randomUUID();
        const sequenceNumber = String(i + 1).padStart(3, "0");
        const slug = `${batchId}-${sequenceNumber}`;

        const tier = materialType === "acrylic" ? "premium" : "free";

        const newTag = {
          id: tagId,
          app_id: "balikin_id",
          slug,
          ownerId: null,
          name: `${batchName} ${sequenceNumber}`,
          status: "unclaimed",
          tier,
          productType: materialType,
          bundleType: productType !== "standard" ? productType : null,
          autoActivateModule: productType !== "standard" ? productType : null,
          isVerified: false,
          emailAlertsEnabled: true,
          whatsappAlertsEnabled: false,
          hasTabTwoEnabled: productType !== "standard",
          welcomeShown: false,
          onboardingCompleted: false,
        };

        await db.insert(tags).values(newTag);

        generatedTags.push({
          slug,
          sequenceNumber,
          filename: `${batchName}-${sequenceNumber}-${slug}.png`,
        });

        const qrUrl = `${baseUrl}/p/${slug}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 600,
          margin: 4,
          color: { dark: "#000000", light: "#ffffff" },
        });

        const base64Data = qrDataUrl.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        zip.file(`${batchName}-${sequenceNumber}-${slug}.png`, buffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipBase64 = zipBuffer.toString("base64");
    const downloadUrl = `data:application/zip;base64,${zipBase64}`;

    const itemsPerSheet = paperSize === "a4" ? 12 : 20;
    const estimatedSheets = Math.ceil(quantity / itemsPerSheet);

    await db.insert(printQueue).values({
      id: randomUUID(),
      app_id: "balikin_id",
      batchId,
      batchName,
      status: "pending",
      itemCount: quantity,
      materialType,
      materialUsed: `${estimatedSheets} lembar ${paperSize.toUpperCase()} (${materialType})`,
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
    });
  } catch (error) {
    console.error("Error generating batch:", error);
    return NextResponse.json({ error: "Failed to generate batch" }, { status: 500 });
  }
}

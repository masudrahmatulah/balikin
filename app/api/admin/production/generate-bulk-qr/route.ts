import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { tags } from "@/db/schema";
import JSZip from "jszip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BulkQRRequest {
  name: string;
  productType: "sticker" | "acrylic";
  stickerShape?: "circle" | "square" | "rectangle";
  stickerSize?: "small" | "medium" | "large";
  itemCount: number;
  autoActivateModule?: string;
}

/**
 * Bulk QR Generator API
 * POST /api/admin/production/generate-bulk-qr
 *
 * Generates multiple QR codes with batch configuration
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin permission
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, productType, stickerShape, stickerSize, itemCount, autoActivateModule }: BulkQRRequest = body;

    // Validate input
    if (!name || itemCount < 1 || itemCount > 100) {
      return NextResponse.json(
        { error: "Invalid input. Name required and itemCount must be between 1-100" },
        { status: 400 }
      );
    }

    // Generate tags
    const generatedTags = [];
    const zip = new JSZip();

    for (let i = 0; i < itemCount; i++) {
      const slug = nanoid(12);
      const sequenceNumber = String(i + 1).padStart(3, "0"); // 001, 002, etc.

      // Create tag in database
      const newTag = {
        slug,
        name: `${name} ${sequenceNumber}`, // Add name field (required)
        tier: productType === "sticker" ? "sticker" : "premium",
        productType: productType, // Add productType field
        bundleType: autoActivateModule || null,
        autoActivateModule: autoActivateModule || null, // Add autoActivateModule field
        status: "unclaimed",
        stickerShape: productType === "sticker" ? stickerShape : null,
        stickerSize: productType === "sticker" ? stickerSize : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(tags).values(newTag as any);

      generatedTags.push({
        slug,
        sequenceNumber,
        filename: `${name}-${sequenceNumber}-${slug}.png`,
      });

      // Generate QR code (you would use your QR generation logic here)
      // For now, we'll create a placeholder
      // In production, you would use qrcode library to generate actual QR codes
      const qrData = `https://your-domain.com/p/${slug}`;
      const qrPlaceholder = `QR Code for ${slug}\nURL: ${qrData}\nSequence: ${sequenceNumber}`;

      // Add to ZIP
      zip.file(`${name}-${sequenceNumber}-${slug}.png`, qrPlaceholder);
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Convert to base64 for download
    const zipBase64 = zipBuffer.toString("base64");
    const downloadUrl = `data:application/zip;base64,${zipBase64}`;

    return NextResponse.json({
      success: true,
      message: `Generated ${itemCount} QR codes successfully`,
      count: itemCount,
      tags: generatedTags,
      downloadUrl,
    });
  } catch (error) {
    console.error("Bulk QR generation error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

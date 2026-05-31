import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";

export const dynamic = "force-dynamic";

const PAPER_DIMENSIONS = {
  a3: { width: 297, height: 420 },
  a4: { width: 210, height: 297 },
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: batchId } = await params;

    // Check admin session
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get batch info from print queue
    const batch = await db.query.printQueue.findFirst({
      where: eq(printQueue.batchId, batchId),
    });

    if (!batch) {
      return new NextResponse("Batch not found", { status: 404 });
    }

    // Get tags for this batch
    // Since tags are created with slug as `${batchId}-${i + 1}`
    const batchTags = await db.query.tags.findMany({
      where: sql`${tags.slug} LIKE ${batchId + "-%"}`,
      orderBy: (tags, { asc }) => [asc(tags.slug)],
    });

    if (batchTags.length === 0) {
      return new NextResponse("No tags found for this batch", { status: 404 });
    }

    // Determine paper size from materialUsed (e.g., "9 lembar A4 (sticker)")
    const paperSize = batch.materialUsed?.toLowerCase().includes("a3") ? "a3" : "a4";
    const { width: paperWidth, height: paperHeight } = PAPER_DIMENSIONS[paperSize];

    // Create PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize,
    });

    // Grid settings
    const cols = paperSize === "a4" ? 3 : 4;
    const rows = paperSize === "a4" ? 4 : 5;
    const margin = 10;
    const spacing = 5;
    
    const itemWidth = (paperWidth - (margin * 2) - (spacing * (cols - 1))) / cols;
    const itemHeight = (paperHeight - (margin * 2) - (spacing * (rows - 1))) / rows;

    const itemsPerPage = cols * rows;
    const totalPages = Math.ceil(batchTags.length / itemsPerPage);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://balikin.id";

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage();

      // Add page header/branding (optional)
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Balikin Batch: ${batch.batchName} | Page ${p + 1}/${totalPages}`, margin, 7);

      const pageItems = batchTags.slice(p * itemsPerPage, (p + 1) * itemsPerPage);

      for (let i = 0; p * itemsPerPage + i < batchTags.length && i < itemsPerPage; i++) {
        const tag = pageItems[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = margin + (col * (itemWidth + spacing));
        const y = margin + (row * (itemHeight + spacing));

        // Draw card border
        doc.setDrawColor(230, 230, 230);
        doc.roundedRect(x, y, itemWidth, itemHeight, 2, 2, "S");

        // Generate QR Code
        const qrUrl = `${baseUrl}/p/${tag.slug}`;
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          width: 200,
          margin: 1,
          errorCorrectionLevel: "H",
        });

        // Add QR Code
        const qrSize = Math.min(itemWidth * 0.7, itemHeight * 0.6);
        const qrX = x + (itemWidth - qrSize) / 2;
        const qrY = y + 5;
        doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

        // Add text info
        doc.setFontSize(7);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "bold");
        doc.text("BALIKIN", x + itemWidth / 2, qrY + qrSize + 4, { align: "center" });
        
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.text(tag.slug, x + itemWidth / 2, qrY + qrSize + 8, { align: "center" });
        
        doc.setFontSize(5);
        doc.text("Scan untuk hubungi pemilik", x + itemWidth / 2, qrY + qrSize + 11, { align: "center" });
      }
    }

    // Output PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="batch-${batch.batchName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error downloading batch:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

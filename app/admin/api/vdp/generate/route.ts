import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { tags, printQueue } from "@/db/schema";
import { randomUUID } from "crypto";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { batchName, quantity, materialType, productType, paperSize, adminId } = body;

    // Validate input
    if (!batchName || !quantity || !materialType || !productType || !paperSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (quantity < 1 || quantity > 1000) {
      return NextResponse.json({ error: "Quantity must be between 1 and 1000" }, { status: 400 });
    }

    // Generate unique batch ID
    const batchId = randomUUID();

    // Create tags in bulk
    const tagsToCreate = Array.from({ length: quantity }, (_, i) => {
      const tagId = randomUUID();
      const slug = `${batchId}-${i + 1}`;
      return {
        id: tagId,
        app_id: "balikin_id",
        slug,
        ownerId: null, // Unclaimed
        name: `Tag ${i + 1}`,
        status: "unclaimed",
        tier: "free",
        productType,
        bundleType: productType !== "standard" ? productType : null,
        autoActivateModule: productType !== "standard" ? productType : null,
        isVerified: false,
        emailAlertsEnabled: true,
        whatsappAlertsEnabled: false,
        hasTabTwoEnabled: productType !== "standard",
        welcomeShown: false,
        onboardingCompleted: false,
      };
    });

    // Insert tags
    await db.insert(tags).values(tagsToCreate);

    // Add to print queue
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

    // Log the action
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
      },
      ipAddress: ip,
      userAgent,
    });

    // Generate PDF (simplified - just return a success message for now)
    // TODO: Implement actual PDF generation with jsPDF or similar library
    const downloadUrl = `/admin/api/vdp/download/${batchId}`;

    return NextResponse.json({
      success: true,
      batchId,
      batchName,
      quantity,
      downloadUrl,
    });
  } catch (error) {
    console.error("Error generating batch:", error);
    return NextResponse.json({ error: "Failed to generate batch" }, { status: 500 });
  }
}

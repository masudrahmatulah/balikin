import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

// GET - Fetch all QR stok tags (ownerId is null and productType is acrylic)
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all acrylic tags (both claimed and unclaimed)
    const allQrStokTags = await db.query.tags.findMany({
      where: (tags, { eq }) => eq(tags.productType, "acrylic"),
      orderBy: (tags, { desc }) => [desc(tags.createdAt)],
    });

    return NextResponse.json({ tags: allQrStokTags });
  } catch (error) {
    console.error("Error fetching QR stok tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new QR stok tag
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, contactWhatsapp, customMessage, rewardNote } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTag = await db.query.tags.findFirst({
      where: (tags, { eq }) => eq(tags.slug, slug),
    });

    if (existingTag) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Create QR stok tag with ownerId: null
    const newTag = await db.insert(tags).values({
      ownerId: null, // No owner yet - unclaimed stok
      bundleId: null,
      name,
      slug,
      contactWhatsapp: contactWhatsapp || null,
      customMessage: customMessage || null,
      rewardNote: rewardNote || null,
      appId: "balikin_id",
      status: "normal",
      tier: "premium",
      productType: "acrylic",
      isVerified: false,
      emailAlertsEnabled: false,
      whatsappAlertsEnabled: true, // Premium feature enabled by default
    }).returning();

    return NextResponse.json({ tag: newTag[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating QR stok:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a QR stok tag
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json(
        { error: "Missing tagId parameter" },
        { status: 400 }
      );
    }

    // Check if tag exists
    const tag = await db.query.tags.findFirst({
      where: (tags, { eq }) => eq(tags.id, tagId),
    });

    if (!tag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of unclaimed tags
    if (tag.ownerId !== null) {
      return NextResponse.json(
        { error: "Cannot delete claimed tags" },
        { status: 400 }
      );
    }

    // Delete the tag
    await db.delete(tags).where(eq(tags.id, tagId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting QR stok:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

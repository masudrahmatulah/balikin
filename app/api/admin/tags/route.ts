import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { tags } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ownerId, name, slug, contactWhatsapp, customMessage, rewardNote, tier, productType, bundleId } = body;
    const resolvedProductType = productType || (tier === "premium" ? "acrylic" : "free");
    const isPremium = resolvedProductType !== "free" || tier === "premium";

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

    // Create tag
    const newTag = await db.insert(tags).values({
      ownerId,
      bundleId: bundleId || null,
      name,
      slug,
      contactWhatsapp: contactWhatsapp || null,
      customMessage: customMessage || null,
      rewardNote: rewardNote || null,
      app_id: "balikin_id",
      status: "normal",
      tier: isPremium ? "premium" : "free",
      productType: resolvedProductType,
      isVerified: resolvedProductType === "sticker",
      emailAlertsEnabled: isPremium ? false : true,
      whatsappAlertsEnabled: isPremium ? true : false,
    }).returning();

    return NextResponse.json({ tag: newTag[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    const tagsQuery = db.query.tags.findMany({
      orderBy: (tags, { desc }) => [desc(tags.createdAt)],
    });

    const allTags = ownerId
      ? await db.query.tags.findMany({
          where: (tags, { eq }) => eq(tags.ownerId, ownerId),
          orderBy: (tags, { desc }) => [desc(tags.createdAt)],
        })
      : await tagsQuery;

    return NextResponse.json({ tags: allTags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

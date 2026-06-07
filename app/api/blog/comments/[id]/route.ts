import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { blogComments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { waitUntil } from "@vercel/functions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await db
      .update(blogComments)
      .set({
        ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
        ...(body.isGiveawayWinner !== undefined && { isGiveawayWinner: body.isGiveawayWinner }),
        ...(body.hasHeroBadge !== undefined && { hasHeroBadge: body.hasHeroBadge }),
        updatedAt: new Date(),
      })
      .where(eq(blogComments.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    waitUntil(async () => {
      if (body.isGiveawayWinner) {
        console.log(`Sending WhatsApp notification to winner ${updated[0].whatsappNumber}`);
      }
    });

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error("Error updating comment:", error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

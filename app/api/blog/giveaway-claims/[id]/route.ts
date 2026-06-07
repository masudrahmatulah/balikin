import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { giveawayClaims } from "@/db/schema";
import { eq } from "drizzle-orm";
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
      .update(giveawayClaims)
      .set({
        ...(body.status !== undefined && { status: body.status }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
        ...(body.notes !== undefined && { notes: body.notes }),
        processedBy: session.user.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(giveawayClaims.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const claim = updated[0];

    waitUntil(async () => {
      if (body.status === "shipped" && claim.whatsappNumber) {
        console.log(`Sending shipping notification to ${claim.whatsappNumber}: Tracking ${claim.trackingNumber}`);
      }
      if (body.status === "approved") {
        console.log(`Sending approval notification to ${claim.whatsappNumber}`);
      }
    });

    return NextResponse.json(claim);
  } catch (error: any) {
    console.error("Error updating claim:", error);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}

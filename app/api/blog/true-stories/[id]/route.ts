import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trueStorySubmissions } from "@/db/schema";
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
      .update(trueStorySubmissions)
      .set({
        ...(body.status !== undefined && { status: body.status }),
        ...(body.shippingAddress !== undefined && { shippingAddress: body.shippingAddress }),
        ...(body.rejectionReason !== undefined && { rejectionReason: body.rejectionReason }),
        updatedAt: new Date(),
      })
      .where(eq(trueStorySubmissions.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = updated[0];

    waitUntil(async () => {
      if (body.status === "winner_jacket" && submission.whatsappNumber) {
        console.log(`Sending jacket award notification to ${submission.whatsappNumber}`);
      }
      if (body.status === "verified") {
        console.log(`Sending verification confirmation to ${submission.whatsappNumber}`);
      }
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}

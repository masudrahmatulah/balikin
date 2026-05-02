import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { suspensionLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { adminId, liftReason } = body;

    // Get current suspension
    const currentSuspension = await db.query.suspensionLog.findFirst({
      where: eq(suspensionLog.id, params.id),
    });

    if (!currentSuspension) {
      return NextResponse.json({ error: "Suspension not found" }, { status: 404 });
    }

    // Update suspension (lift it)
    await db
      .update(suspensionLog)
      .set({
        isActive: false,
        liftedAt: new Date(),
        liftedBy: adminId,
        liftReason: liftReason || null,
        updatedAt: new Date(),
      })
      .where(eq(suspensionLog.id, params.id));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "lift_suspension",
      entityType: "suspension",
      entityId: params.id,
      originalValue: { isActive: true },
      newValue: { isActive: false, liftReason },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error lifting suspension:", error);
    return NextResponse.json({ error: "Failed to lift suspension" }, { status: 500 });
  }
}

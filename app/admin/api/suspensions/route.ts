import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { suspensionLog, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { suspensionType, identifier, reason, adminId } = body;

    if (!suspensionType || !identifier || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists (if suspending by user ID)
    let userId = null;
    if (suspensionType === "user_id") {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.id, identifier),
      });

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      userId = identifier;
    }

    // Create suspension
    await db.insert(suspensionLog).values({
      id: crypto.randomUUID(),
      app_id: "balikin_id",
      userId,
      suspensionType,
      identifier,
      reason,
      suspendedBy: adminId,
      suspendedAt: new Date(),
      isActive: true,
    });

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "create_suspension",
      entityType: "suspension",
      entityId: identifier,
      originalValue: null,
      newValue: { suspensionType, reason },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating suspension:", error);
    return NextResponse.json({ error: "Failed to create suspension" }, { status: 500 });
  }
}

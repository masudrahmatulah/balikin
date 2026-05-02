import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { user } from "@/db/schema";
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
    const { userId, newRole, adminId } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    await db
      .update(user)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(user.id, userId));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: "change_user_tier",
      entityType: "user",
      entityId: userId,
      originalValue: { role: currentUser.role },
      newValue: { role: newRole },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating tier:", error);
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}

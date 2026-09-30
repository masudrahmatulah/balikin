import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { Division } from "@/lib/admin-divisions";
import { db } from "@/db";
import { user } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";
const APP_ID = "balikin_id";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.division !== Division.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !["user", "premium"].includes(newRole)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.query.user.findFirst({
      where: and(eq(user.id, userId), eq(user.app_id, APP_ID)),
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    await db
      .update(user)
      .set({ role: newRole, updatedAt: new Date() })
      .where(and(eq(user.id, userId), eq(user.app_id, APP_ID)));

    // Log the action
    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
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

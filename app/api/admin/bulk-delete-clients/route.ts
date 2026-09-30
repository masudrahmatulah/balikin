import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionForAction } from "@/lib/admin";
import { hasPermission } from "@/lib/admin-divisions";
import { db } from "@/db";
import { user, tags, studentKitData } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // FIXED: Use centralized isAdmin() function for consistent authorization
    const adminSession = await getAdminSessionForAction();
    if (!adminSession || !hasPermission(adminSession.user.division, 'client_management')) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    // Get current admin user from session for validation
    const { getCurrentAdminUser } = await import("@/lib/admin");
    const currentUser = await getCurrentAdminUser();

    const body = await req.json();
    const { userIds } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid userIds" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (currentUser && userIds.includes(currentUser.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Cascade delete all related data
    // 1. Delete student kit data
    await db.delete(studentKitData).where(and(
      inArray(studentKitData.userId, userIds),
      eq(studentKitData.app_id, "balikin_id")
    ));

    // 2. Delete tags owned by these users.
    // scan_logs and emergency_information reference tags with ON DELETE CASCADE,
    // so they're cleaned up automatically by Postgres.
    await db.delete(tags).where(and(
      inArray(tags.ownerId, userIds),
      eq(tags.app_id, "balikin_id")
    ));

    // 3. Delete users
    await db.delete(user).where(and(
      inArray(user.id, userIds),
      eq(user.app_id, "balikin_id")
    ));

    return NextResponse.json({
      success: true,
      message: `Deleted ${userIds.length} clients`,
    });
  } catch (error) {
    console.error("Error bulk deleting clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

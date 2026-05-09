import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { user, tags, scanLogs, studentKitData, emergencyInformation } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // FIXED: Use centralized isAdmin() function for consistent authorization
    const adminCheck = await isAdmin();
    if (!adminCheck) {
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

    const body = await req.json();
    const { userIds } = body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "Invalid userIds" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Cascade delete all related data
    // 1. Delete student kit data
    await db.delete(studentKitData).where(inArray(studentKitData.userId, userIds));

    // 2. Delete emergency info
    await db.delete(emergencyInformation).where(inArray(emergencyInformation.userId, userIds));

    // 3. Delete scan logs (by finding tags first, then deleting their scan logs)
    const userTags = await db.query.tags.findMany({
      where: inArray(tags.ownerId, userIds),
      columns: { id: true },
    });

    if (userTags.length > 0) {
      const tagIds = userTags.map((t) => t.id);
      await db.delete(scanLogs).where(inArray(scanLogs.tagId, tagIds));
    }

    // 4. Delete tags
    await db.delete(tags).where(inArray(tags.ownerId, userIds));

    // 5. Delete users
    await db.delete(user).where(inArray(user.id, userIds));

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

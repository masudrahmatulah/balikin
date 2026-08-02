import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { tags, scanLogs, emergencyInformation, diklatData, tagDocuments } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const body = await req.json();
    const { tagIds } = body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json({ error: "Invalid tagIds" }, { status: 400 });
    }

    // Cascade delete all related data
    // 1. Delete tag documents
    await db.delete(tagDocuments).where(inArray(tagDocuments.tagId, tagIds));

    // 2. Delete diklat data
    await db.delete(diklatData).where(inArray(diklatData.tagId, tagIds));

    // 3. Delete emergency information
    await db.delete(emergencyInformation).where(inArray(emergencyInformation.tagId, tagIds));

    // 4. Delete notification logs (cascade via tagId)
    const { notificationLogs } = await import("@/db/schema");
    await db.delete(notificationLogs).where(inArray(notificationLogs.tagId, tagIds));

    // 5. Delete scan logs
    await db.delete(scanLogs).where(inArray(scanLogs.tagId, tagIds));

    // 6. Delete tags
    await db.delete(tags).where(inArray(tags.id, tagIds));

    return NextResponse.json({
      success: true,
      message: `Deleted ${tagIds.length} tags`,
    });
  } catch (error) {
    console.error("Error bulk deleting tags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

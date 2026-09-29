import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { tags, scanLogs, emergencyInformation, diklatData, tagDocuments, printQueue, printBatches, stickerSheets } from "@/db/schema";
import { inArray, and, eq, notInArray } from "drizzle-orm";

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

    // 0. Clean up print batches whose tags are ALL being deleted, plus their
    //    print-queue entries. Without this, /admin/print-queue keeps showing
    //    orphaned jobs after tags are removed.
    const batchRows = await db
      .select({ batchId: tags.batchId })
      .from(tags)
      .where(and(
        inArray(tags.id, tagIds),
        eq(tags.app_id, "balikin_id")
      ))
      .groupBy(tags.batchId);
    const affectedBatchIds = batchRows
      .map((row) => row.batchId)
      .filter((id): id is string => Boolean(id));

    if (affectedBatchIds.length > 0) {
      const keptBatches = await db
        .select({ batchId: printBatches.id })
        .from(tags)
        .where(
          and(
            inArray(tags.batchId, affectedBatchIds),
            notInArray(tags.id, tagIds),
            eq(tags.app_id, "balikin_id")
          )
        )
        .groupBy(tags.batchId);

      const keptSet = new Set(keptBatches.map((row) => row.batchId));
      const orphanedBatchIds = affectedBatchIds.filter((id) => !keptSet.has(id));

      // Sticker sheets (Master PIN) belonging to the orphaned batches are also
      // orphans once their QR tags disappear, so remove them too.
      let orphanedSheetIds: string[] = [];
      if (orphanedBatchIds.length > 0) {
        const sheetRows = await db
          .select({ id: stickerSheets.id })
          .from(stickerSheets)
          .where(and(
            inArray(stickerSheets.batchId, orphanedBatchIds),
            eq(stickerSheets.app_id, "balikin_id")
          ));
        orphanedSheetIds = sheetRows.map((row) => row.id);
      }

      if (orphanedBatchIds.length > 0) {
        await db.delete(printQueue).where(and(
          inArray(printQueue.batchId, orphanedBatchIds),
          eq(printQueue.app_id, "balikin_id")
        ));
        await db.delete(printBatches).where(and(
          inArray(printBatches.id, orphanedBatchIds),
          eq(printBatches.app_id, "balikin_id")
        ));
      }

      if (orphanedSheetIds.length > 0) {
        await db.delete(stickerSheets).where(and(
          inArray(stickerSheets.id, orphanedSheetIds),
          eq(stickerSheets.app_id, "balikin_id")
        ));
      }
    }

    // Cascade delete all related data
    // 1. Delete tag documents
    await db.delete(tagDocuments).where(and(
      inArray(tagDocuments.tagId, tagIds),
      eq(tagDocuments.app_id, "balikin_id")
    ));

    // 2. Delete diklat data
    await db.delete(diklatData).where(and(
      inArray(diklatData.tagId, tagIds),
      eq(diklatData.app_id, "balikin_id")
    ));

    // 3. Delete emergency information
    await db.delete(emergencyInformation).where(and(
      inArray(emergencyInformation.tagId, tagIds),
      eq(emergencyInformation.app_id, "balikin_id")
    ));

    // 4. Delete notification logs (cascade via tagId)
    const { notificationLogs } = await import("@/db/schema");
    await db.delete(notificationLogs).where(and(
      inArray(notificationLogs.tagId, tagIds),
      eq(notificationLogs.app_id, "balikin_id")
    ));

    // 5. Delete scan logs
    await db.delete(scanLogs).where(and(
      inArray(scanLogs.tagId, tagIds),
      eq(scanLogs.app_id, "balikin_id")
    ));

    // 6. Delete tags
    await db.delete(tags).where(and(
      inArray(tags.id, tagIds),
      eq(tags.app_id, "balikin_id")
    ));

    // Invalidate caches so /admin/production/stock, dashboard overview, print-queue
    // and tags pages reflect the deletion immediately instead of serving stale data.
    revalidateTag("admin-stats", "max");
    revalidateTag("stock-stats", "max");
    revalidateTag("stock-details", "max");
    revalidateTag("recent-tags", "max");
    revalidateTag("admin-overview", "max");
    revalidatePath("/admin/production/stock");
    revalidatePath("/admin/tags");
    revalidatePath("/admin/print-queue");
    revalidatePath("/admin");

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

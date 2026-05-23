import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { printQueue } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { logAuditAction, getRequestContext } from "@/lib/admin-audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, status, adminId } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs are required" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Get current items
    const currentItems = await db.query.printQueue.findMany({
      where: inArray(printQueue.id, ids),
    });

    if (currentItems.length === 0) {
      return NextResponse.json({ error: "No items found" }, { status: 404 });
    }

    const currentItemsMap = new Map(currentItems.map(item => [item.id, item]));

    // Prepare update data for each item
    const updates = ids.map(id => {
      const currentItem = currentItemsMap.get(id);
      if (!currentItem) return null;

      const updateData: any = { status };

      if (status === "printing" && !currentItem.printedAt) {
        updateData.printedAt = new Date();
        updateData.printedBy = adminId;
      }

      if (status === "completed" && !currentItem.completedAt) {
        updateData.completedAt = new Date();
      }

      return { id, updateData };
    }).filter(Boolean);

    // Execute updates
    for (const { id, updateData } of updates) {
      await db
        .update(printQueue)
        .set(updateData)
        .where(inArray(printQueue.id, [id]));
    }

    // Log audit actions
    const { ip, userAgent } = await getRequestContext();
    await Promise.all(
      currentItems.map(item => {
        const currentItem = currentItemsMap.get(item.id);
        if (!currentItem) return null;

        return logAuditAction({
          adminId,
          action: "bulk_update_print_queue_status",
          entityType: "print_queue",
          entityId: item.id,
          originalValue: { status: currentItem.status },
          newValue: { status },
          ipAddress: ip,
          userAgent,
        });
      })
    );

    return NextResponse.json({ success: true, updatedCount: updates.length });
  } catch (error) {
    console.error("Error bulk updating print queue status:", error);
    return NextResponse.json({ error: "Failed to bulk update status" }, { status: 500 });
  }
}
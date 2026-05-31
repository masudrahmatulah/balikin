import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { printQueue } from '@/db/schema';
import { inArray, and, eq } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';

const APP_ID = 'balikin_id';
const VALID_STATUSES = [
  'pending',
  'printing',
  'quality_check',
  'ready_for_stock',
  'completed',
] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, status, adminId } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs are required' }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const currentItems = await db.query.printQueue.findMany({
      where: and(inArray(printQueue.id, ids), eq(printQueue.app_id, APP_ID)),
    });

    if (currentItems.length === 0) {
      return NextResponse.json({ error: 'No items found' }, { status: 404 });
    }

    const currentItemsMap = new Map(currentItems.map(item => [item.id, item]));

    const updates = currentItems.map(item => {
      const updateData: any = { status };

      if (status === 'printing' && !item.printedAt) {
        updateData.printedAt = new Date();
        updateData.printedBy = adminId;
      }

      if (status === 'completed' && !item.completedAt) {
        updateData.completedAt = new Date();
      }

      return { id: item.id, updateData };
    }).filter(Boolean);

    for (const { id, updateData } of updates) {
      await db
        .update(printQueue)
        .set(updateData)
        .where(eq(printQueue.id, id));
    }

    const { ip, userAgent } = await getRequestContext();
    await Promise.all(
      currentItems.map(item => {
        const currentItem = currentItemsMap.get(item.id);
        if (!currentItem) return null;

        return logAuditAction({
          adminId,
          action: 'bulk_update_print_queue_status',
          entityType: 'print_queue',
          entityId: item.id,
          originalValue: { status: currentItem.status },
          newValue: { status },
          ipAddress: ip,
          userAgent,
        });
      })
    );

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to bulk update status' },
      { status: 500 }
    );
  }
}
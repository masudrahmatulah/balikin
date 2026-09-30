import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { hasPermission } from '@/lib/admin-divisions';
import { db } from '@/db';
import { printQueue, type NewPrintQueue } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';

const APP_ID = 'balikin_id';
const VALID_STATUSES = [
  'pending',
  'printing',
  'quality_check',
  'ready_for_stock',
  'completed',
] as const;
type PrintQueueStatus = typeof VALID_STATUSES[number];

function isPrintQueueStatus(value: unknown): value is PrintQueueStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as PrintQueueStatus);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.division, 'print_queue')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json() as { status?: unknown };
    const { status } = body;

    if (!isPrintQueueStatus(status)) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const currentItem = await db.query.printQueue.findFirst({
      where: and(
        eq(printQueue.id, id),
        eq(printQueue.app_id, APP_ID)
      ),
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Print queue item not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<NewPrintQueue> = { status };

    if (status === 'printing' && !currentItem.printedAt) {
      updateData.printedAt = new Date();
      updateData.printedBy = session.user.id;
    }

    if (status === 'completed' && !currentItem.completedAt) {
      updateData.completedAt = new Date();
    }

    await db
      .update(printQueue)
      .set(updateData)
      .where(and(eq(printQueue.id, id), eq(printQueue.app_id, APP_ID)));

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId: session.user.id,
      action: 'update_print_queue_status',
      entityType: 'print_queue',
      entityId: id,
      originalValue: { status: currentItem.status },
      newValue: { status },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

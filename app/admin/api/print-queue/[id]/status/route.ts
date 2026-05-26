import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { printQueue } from '@/db/schema';
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, adminId } = body;

    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const currentItem = await db.query.printQueue.findFirst({
      where: and(
        eq(printQueue.id, params.id),
        eq(printQueue.appId, APP_ID)
      ),
    });

    if (!currentItem) {
      return NextResponse.json(
        { error: 'Print queue item not found' },
        { status: 404 }
      );
    }

    const updateData: any = { status };

    if (status === 'printing' && !currentItem.printedAt) {
      updateData.printedAt = new Date();
      updateData.printedBy = adminId;
    }

    if (status === 'completed' && !currentItem.completedAt) {
      updateData.completedAt = new Date();
    }

    await db
      .update(printQueue)
      .set(updateData)
      .where(eq(printQueue.id, params.id));

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: 'update_print_queue_status',
      entityType: 'print_queue',
      entityId: params.id,
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
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { suspensionLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';

const APP_ID = 'balikin_id';
const MAX_LIFT_REASON_LENGTH = 500;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { adminId, liftReason } = body;

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    if (liftReason && liftReason.length > MAX_LIFT_REASON_LENGTH) {
      return NextResponse.json(
        { error: 'Lift reason is too long' },
        { status: 400 }
      );
    }

    const currentSuspension = await db.query.suspensionLog.findFirst({
      where: and(eq(suspensionLog.id, params.id), eq(suspensionLog.appId, APP_ID)),
    });

    if (!currentSuspension) {
      return NextResponse.json(
        { error: 'Suspension not found' },
        { status: 404 }
      );
    }

    await db
      .update(suspensionLog)
      .set({
        isActive: false,
        liftedAt: new Date(),
        liftedBy: adminId,
        liftReason: liftReason?.trim() || null,
      })
      .where(eq(suspensionLog.id, params.id));

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: 'lift_suspension',
      entityType: 'suspension',
      entityId: params.id,
      originalValue: { isActive: true },
      newValue: { isActive: false, liftReason },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to lift suspension' },
      { status: 500 }
    );
  }
}
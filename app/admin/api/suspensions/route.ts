import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { suspensionLog, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditAction, getRequestContext } from '@/lib/admin-audit';
import { createSuspension } from '../../suspension-tool/actions';

const APP_ID = 'balikin_id';
const MAX_REASON_LENGTH = 500;
const MAX_IDENTIFIER_LENGTH = 255;

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { suspensionType, identifier, reason, adminId } = body;

    if (!suspensionType || !['user_id', 'device_id'].includes(suspensionType)) {
      return NextResponse.json(
        { error: 'Invalid suspension type' },
        { status: 400 }
      );
    }

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    if (identifier.length > MAX_IDENTIFIER_LENGTH) {
      return NextResponse.json(
        { error: 'Identifier is too long' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    if (reason.length > MAX_REASON_LENGTH) {
      return NextResponse.json(
        { error: 'Reason is too long' },
        { status: 400 }
      );
    }

    let userId = null;
    if (suspensionType === 'user_id') {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.id, identifier),
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      userId = identifier;
    }

    const [suspension] = await db
      .insert(suspensionLog)
      .values({
        id: crypto.randomUUID(),
        app_id: APP_ID,
        userId,
        suspensionType,
        identifier: identifier.trim(),
        reason: reason.trim(),
        suspendedBy: adminId,
        suspendedAt: new Date(),
        isActive: true,
      })
      .returning();

    const { ip, userAgent } = await getRequestContext();
    await logAuditAction({
      adminId,
      action: 'create_suspension',
      entityType: 'suspension',
      entityId: suspension.id,
      originalValue: null,
      newValue: { suspensionType, reason },
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create suspension' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updateModuleConfig } from '@/app/actions/module-config-actions';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ moduleType: string }> }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin role
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!dbUser || dbUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { moduleType } = await params;
    const body = await request.json();

    await updateModuleConfig({
      moduleType: moduleType as any,
      ...body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update module config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update module config' },
      { status: 500 }
    );
  }
}

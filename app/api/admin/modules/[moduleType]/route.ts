import { NextRequest, NextResponse } from 'next/server';
import { updateModuleConfig } from '@/app/actions/module-config-actions';
import { isAdmin } from '@/lib/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ moduleType: string }> }
) {
  // FIXED: Use centralized isAdmin() function for consistent authorization
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
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

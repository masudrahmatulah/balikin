import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Automated payment processing is disabled. Payments require manual QRIS verification.' },
    { status: 410 },
  );
}

export async function GET() {
  return POST();
}

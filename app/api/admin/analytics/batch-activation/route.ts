import { NextResponse } from "next/server";
import { getBatchActivationMetricsCached } from "./data-access";
import { isAdmin } from '@/lib/admin';

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getBatchActivationMetricsCached();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data batch activation" },
      { status: 500 }
    );
  }
}

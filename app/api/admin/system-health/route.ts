import { NextResponse } from "next/server";
import { getSystemHealthStats } from "@/app/admin/actions/overview-actions";
import { isAdmin } from '@/lib/admin';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getSystemHealthStats();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch system health:", error);
    return NextResponse.json(
      { error: "Failed to fetch system health" },
      { status: 500 }
    );
  }
}

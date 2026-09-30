import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getLostFoundRateCached } from "./data-access";
import { isAdmin } from '@/lib/admin';

export const runtime = "nodejs";

const daysSchema = z.coerce
  .number()
  .int()
  .min(1, "Minimal 1 hari")
  .max(365, "Maksimal 365 hari")
  .default(30);

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const daysResult = daysSchema.safeParse(searchParams.get("days"));

    if (!daysResult.success) {
      return NextResponse.json(
        { error: daysResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const days = daysResult.data;
    const data = await getLostFoundRateCached(days);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data lost & found" },
      { status: 500 }
    );
  }
}

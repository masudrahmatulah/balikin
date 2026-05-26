import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLostFoundRateCached } from "./data-access";

export const runtime = "nodejs";

const daysSchema = z.coerce
  .number()
  .int()
  .min(1, "Minimal 1 hari")
  .max(365, "Maksimal 365 hari")
  .default(30);

export async function GET(request: NextRequest) {
  try {
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
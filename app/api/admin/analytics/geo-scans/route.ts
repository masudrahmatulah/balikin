import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeoScanDataCached } from "./data-access";

export const runtime = "nodejs";

const daysSchema = z.coerce
  .number()
  .int()
  .min(1, "Minimal 1 hari")
  .max(365, "Maksimal 365 hari")
  .default(7);

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
    const data = await getGeoScanDataCached(days);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data geo scan" },
      { status: 500 }
    );
  }
}
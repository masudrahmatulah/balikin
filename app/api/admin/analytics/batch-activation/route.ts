import { NextResponse } from "next/server";
import { getBatchActivationMetricsCached } from "./data-access";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getBatchActivationMetricsCached();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil data batch activation" },
      { status: 500 }
    );
  }
}
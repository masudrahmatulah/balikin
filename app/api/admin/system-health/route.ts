import { NextResponse } from "next/server";
import { getSystemHealthStats } from "@/app/admin/actions/overview-actions";

export async function GET() {
  try {
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
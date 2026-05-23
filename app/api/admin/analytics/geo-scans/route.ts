import { NextRequest, NextResponse } from "next/server";
import { getGeoScanData } from "@/app/admin/actions/overview-actions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7", 10);

    const data = await getGeoScanData(days);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch geo scan data:", error);
    return NextResponse.json(
      { error: "Failed to fetch geo scan data" },
      { status: 500 }
    );
  }
}
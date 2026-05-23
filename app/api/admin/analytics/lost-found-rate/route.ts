import { NextRequest, NextResponse } from "next/server";
import { getLostFoundSuccessRate } from "@/app/admin/actions/overview-actions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "30", 10);

    const data = await getLostFoundSuccessRate(days);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch lost & found rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch lost & found rate" },
      { status: 500 }
    );
  }
}
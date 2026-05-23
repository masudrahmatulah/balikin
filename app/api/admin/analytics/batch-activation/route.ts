import { NextResponse } from "next/server";
import { getBatchActivationMetrics } from "@/app/admin/actions/overview-actions";

export async function GET() {
  try {
    const data = await getBatchActivationMetrics();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch batch activation metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch activation metrics" },
      { status: 500 }
    );
  }
}
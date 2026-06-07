import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lostLocationsReport } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/blog/location-reports?postId=xxx - Get all location reports for a post
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId parameter" }, { status: 400 });
    }

    const reports = await db.query.lostLocationsReport.findMany({
      where: eq(lostLocationsReport.postId, postId),
      orderBy: [lostLocationsReport.createdAt],
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Location reports fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

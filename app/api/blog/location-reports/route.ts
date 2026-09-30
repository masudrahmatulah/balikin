import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { lostLocationsReport } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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
      where: and(
        eq(lostLocationsReport.postId, postId),
        eq(lostLocationsReport.app_id, "balikin_id"),
      ),
      orderBy: [lostLocationsReport.createdAt],
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Location reports fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

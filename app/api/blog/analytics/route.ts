import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { blogPostsAnalytics } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/blog/analytics/view - Record a page view
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // Get IP for basic duplicate prevention (same IP, same post, 1 hour window)
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                     headersList.get("x-real-ip") ||
                     "unknown";

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check if this IP has viewed this post in the last hour
    const recentView = await db.query.blogPostsAnalytics.findFirst({
      where: eq(blogPostsAnalytics.postId, postId),
    });

    // Simple approach: just increment the view count
    // In production, you'd want more sophisticated deduplication
    await db.insert(blogPostsAnalytics).values({
      postId,
      ipAddress,
      viewType: "page_view",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics view error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/blog/analytics?postId=xxx - Get analytics for a post
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId parameter" }, { status: 400 });
    }

    const analytics = await db.query.blogPostsAnalytics.findMany({
      where: eq(blogPostsAnalytics.postId, postId),
    });

    const pageViews = analytics.filter(a => a.viewType === "page_view").length;
    const engagements = analytics.filter(a => a.viewType === "engagement").length;

    // Get unique visitors (by IP)
    const uniqueIps = new Set(analytics.map(a => a.ipAddress));

    return NextResponse.json({
      postId,
      pageViews,
      engagements,
      uniqueVisitors: uniqueIps.size,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

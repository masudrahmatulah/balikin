import { NextRequest, NextResponse } from "next/server";
import { getRelatedPosts } from "@/lib/blog-queries";

/**
 * GET /api/blog/related?postId=xxx - Get related posts based on content similarity
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    const limit = parseInt(searchParams.get("limit") || "3");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId parameter" }, { status: 400 });
    }

    const relatedPosts = await getRelatedPosts(postId, Math.min(Math.max(limit, 1), 10));

    return NextResponse.json({
      related: relatedPosts,
    });
  } catch (error) {
    console.error("Related posts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

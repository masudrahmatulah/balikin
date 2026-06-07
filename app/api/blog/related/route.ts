import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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

    // Get the current post
    const currentPost = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId),
    });

    if (!currentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get related posts based on:
    // 1. Same focus keyword
    // 2. Similar content keywords (simple word overlap)
    const relatedPosts = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.isPublished, true),
        // Exclude current post
        sql`${blogPosts.id} != ${postId}`
      ),
      orderBy: [desc(blogPosts.publishedAt)],
      limit: limit * 2, // Get more, then filter
    });

    // Simple similarity scoring based on:
    // - Focus keyword match
    // - Meta keyword overlap
    // - Word overlap in title/summary
    const scoredPosts = relatedPosts
      .map((post) => {
        let score = 0;

        // Focus keyword match
        if (currentPost.focusKeyword && post.focusKeyword) {
          if (currentPost.focusKeyword.toLowerCase() === post.focusKeyword.toLowerCase()) {
            score += 10;
          }
        }

        // Meta keyword overlap
        if (currentPost.metaKeywords && post.metaKeywords) {
          const currentKeywords = currentPost.metaKeywords.toLowerCase().split(/[,\s]+/);
          const postKeywords = post.metaKeywords.toLowerCase().split(/[,\s]+/);
          const overlap = currentKeywords.filter((k) => postKeywords.includes(k)).length;
          score += overlap * 2;
        }

        // Title word overlap
        const currentWords = currentPost.title.toLowerCase().split(/\s+/);
        const postWords = post.title.toLowerCase().split(/\s+/);
        const titleOverlap = currentWords.filter((w) => w.length > 3 && postWords.includes(w)).length;
        score += titleOverlap;

        return { post, score };
      })
      .filter((item) => item.score > 0) // Only include posts with some relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({
      related: scoredPosts.map((item) => item.post),
    });
  } catch (error) {
    console.error("Related posts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

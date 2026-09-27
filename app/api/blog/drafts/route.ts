import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

/**
 * GET /api/blog/drafts - List all draft posts (isPublished = false)
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const drafts = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.app_id, "balikin_id"),
        eq(blogPosts.isPublished, false),
        isNull(blogPosts.scheduledAt),
        isNull(blogPosts.deletedAt),
      ),
      orderBy: [desc(blogPosts.createdAt)],
    });
    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Drafts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, isNull, or, desc } from "drizzle-orm";

/**
 * GET /api/blog/drafts - List all draft posts (isPublished = false)
 */
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const drafts = await db.query.blogPosts.findMany({
      where: eq(blogPosts.isPublished, false),
      orderBy: [desc(blogPosts.createdAt)],
    });

    // Filter out scheduled posts (those with scheduledAt in future)
    const now = new Date();
    const trueDrafts = drafts.filter((post) => !post.scheduledAt || new Date(post.scheduledAt) > now);

    return NextResponse.json({ drafts: trueDrafts });
  } catch (error) {
    console.error("Drafts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

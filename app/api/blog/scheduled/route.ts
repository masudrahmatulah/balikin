import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, isNotNull, gt, desc } from "drizzle-orm";

/**
 * GET /api/blog/scheduled - List all scheduled posts (scheduledAt in future)
 */
export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const allUnpublished = await db.query.blogPosts.findMany({
      where: eq(blogPosts.isPublished, false),
      orderBy: [desc(blogPosts.scheduledAt)],
    });

    // Filter for posts with scheduledAt in the future
    const scheduledPosts = allUnpublished.filter(
      (post) => post.scheduledAt && new Date(post.scheduledAt) > now
    );

    return NextResponse.json({ scheduled: scheduledPosts });
  } catch (error) {
    console.error("Scheduled posts fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

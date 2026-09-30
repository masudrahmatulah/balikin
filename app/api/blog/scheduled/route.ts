import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/blog/scheduled - List all scheduled posts (scheduledAt in future)
 */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const allUnpublished = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.app_id, "balikin_id"),
        eq(blogPosts.isPublished, false),
      ),
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

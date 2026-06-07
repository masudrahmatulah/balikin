import { NextRequest, NextResponse } from "next/server";
import { publishScheduledPosts } from "@/lib/blog-publish";

/**
 * Cron job handler: Publish scheduled posts every 5 minutes.
 * Protected by Vercel Cron authentication.
 */
export async function GET(req: NextRequest) {
  // Verify this is a cron request (Vercel header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expectedAuth = `Bearer ${cronSecret}`;
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await publishScheduledPosts();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also support POST for testing
export async function POST(req: NextRequest) {
  return GET(req);
}

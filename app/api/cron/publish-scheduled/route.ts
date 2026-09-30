import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { publishScheduledPosts } from "@/lib/blog-publish";
import { isCronAuthorized } from '@/lib/cron-auth';

/**
 * Cron job handler: Publish scheduled posts every 5 minutes.
 * Protected by Vercel Cron authentication.
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

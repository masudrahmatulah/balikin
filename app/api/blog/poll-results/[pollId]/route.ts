import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pollVotes, blogPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params;
    const { searchParams } = await req.nextUrl;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId parameter" }, { status: 400 });
    }

    // Verify post exists and get poll module
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const modules = post.modules as any[];
    const pollModule = modules.find((m) => m.type === "instant_poll" && m.pollId === pollId);

    if (!pollModule) {
      return NextResponse.json({ error: "Poll module not found" }, { status: 404 });
    }

    // Get all votes for this poll
    const votes = await db.query.pollVotes.findMany({
      where: and(
        eq(pollVotes.postId, postId),
        eq(pollVotes.pollId, pollId)
      ),
    });

    const optionCounts: Record<number, number> = {};
    votes.forEach((vote) => {
      optionCounts[vote.selectedOptionIndex] = (optionCounts[vote.selectedOptionIndex] || 0) + 1;
    });

    const counts = pollModule.options.map((_: string, idx: number) => optionCounts[idx] || 0);

    return NextResponse.json({
      pollId,
      options: pollModule.options,
      counts,
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error("Poll results error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

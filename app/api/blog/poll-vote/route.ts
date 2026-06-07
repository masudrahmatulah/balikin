import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { pollVotes, blogPosts } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, pollId, selectedOptionIndex } = body;

    if (!postId || !pollId || selectedOptionIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify post exists
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get IP address for basic duplicate prevention
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-vercel-forwarded-for") || "unknown";

    // Check if this IP has already voted for this poll
    const existingVote = await db.query.pollVotes.findFirst({
      where: and(
        eq(pollVotes.postId, postId),
        eq(pollVotes.pollId, pollId),
        eq(pollVotes.ipAddress, ipAddress)
      ),
    });

    if (existingVote) {
      return NextResponse.json({ error: "Anda sudah memberikan suara untuk polling ini." }, { status: 400 });
    }

    // Record the vote
    await db.insert(pollVotes).values({
      postId,
      pollId,
      selectedOptionIndex,
      ipAddress,
    });

    // Calculate updated results
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

    // Find the module to get options count
    const modules = post.modules as any[];
    const pollModule = modules.find((m) => m.type === "instant_poll" && m.pollId === pollId);

    if (!pollModule) {
      return NextResponse.json({ error: "Poll module not found" }, { status: 404 });
    }

    const counts = pollModule.options.map((_: string, idx: number) => optionCounts[idx] || 0);

    return NextResponse.json({
      success: true,
      results: {
        pollId,
        options: pollModule.options,
        counts,
        totalVotes: votes.length,
      },
    });
  } catch (error) {
    console.error("Poll vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

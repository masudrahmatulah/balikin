import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { pollVotes, blogPosts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, pollId, selectedOptionIndex } = body;

    if (!postId || !pollId || selectedOptionIndex === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify post exists
    const post = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.id, postId),
        eq(blogPosts.app_id, "balikin_id")
      ),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get IP address for basic duplicate prevention
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-vercel-forwarded-for") || "unknown";

    // Serialize the duplicate check and insert because the schema has no unique constraint.
    let voteRecorded: boolean;
    try {
      voteRecorded = await db.transaction(async (tx) => {
        const existingVote = await tx.query.pollVotes.findFirst({
          where: and(
            eq(pollVotes.app_id, "balikin_id"),
            eq(pollVotes.postId, postId),
            eq(pollVotes.pollId, pollId),
            eq(pollVotes.ipAddress, ipAddress)
          ),
        });

        if (existingVote) {
          return false;
        }

        await tx.insert(pollVotes).values({
          app_id: "balikin_id",
          postId,
          pollId,
          selectedOptionIndex,
          ipAddress,
        });

        return true;
      }, { isolationLevel: "serializable" });
    } catch (error) {
      if ((error as { code?: string }).code === "40001") {
        const concurrentVote = await db.query.pollVotes.findFirst({
          where: and(
            eq(pollVotes.app_id, "balikin_id"),
            eq(pollVotes.postId, postId),
            eq(pollVotes.pollId, pollId),
            eq(pollVotes.ipAddress, ipAddress)
          ),
        });

        if (concurrentVote) {
          return NextResponse.json({ error: "Anda sudah memberikan suara untuk polling ini." }, { status: 400 });
        }
      }

      throw error;
    }

    if (!voteRecorded) {
      return NextResponse.json({ error: "Anda sudah memberikan suara untuk polling ini." }, { status: 400 });
    }

    // Calculate updated results
    const votes = await db.query.pollVotes.findMany({
      where: and(
        eq(pollVotes.app_id, "balikin_id"),
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

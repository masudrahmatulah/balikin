import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { checkBlogQuizRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { findQuizModule, gradeQuizAnswers } from "@/lib/blog-quiz";

function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || request.headers.get("cf-connecting-ip")
    || "unknown";
}

export async function POST(request: NextRequest) {
  const rateLimit = await checkBlogQuizRateLimit(getClientIP(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan kuis. Silakan tunggu beberapa saat." },
      { status: 429, headers: { ...getRateLimitHeaders(rateLimit), "Retry-After": String(rateLimit.retryAfter) } },
    );
  }

  let body: { postId?: unknown; quizId?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data jawaban tidak valid." }, { status: 400 });
  }

  const postId = typeof body.postId === "string" ? body.postId : "";
  const quizId = typeof body.quizId === "string" ? body.quizId : "";
  if (!postId || !quizId) return NextResponse.json({ error: "Artikel atau kuis tidak ditemukan." }, { status: 400 });

  const post = await db.query.blogPosts.findFirst({
    where: and(
      eq(blogPosts.id, postId),
      eq(blogPosts.isPublished, true),
      eq(blogPosts.app_id, "balikin_id"),
      isNull(blogPosts.deletedAt),
    ),
    columns: { modules: true },
  });
  if (!post) return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });

  const quiz = findQuizModule(post.modules, quizId);
  if (!quiz) return NextResponse.json({ error: "Kuis tidak ditemukan atau belum dikonfigurasi dengan benar." }, { status: 404 });

  const result = gradeQuizAnswers(quiz, body.answers);
  if (!result) return NextResponse.json({ error: "Jumlah atau format jawaban tidak sesuai dengan kuis." }, { status: 400 });

  return NextResponse.json({ ...result, minScoreToWin: quiz.minScoreToWin });
}

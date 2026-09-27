import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { blogContentPlans, blogPosts } from "@/db/schema";

const APP_ID = "balikin_id";
const MAX_BULK_POSTS = 100;

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { postIds?: unknown; startAt?: unknown; intervalDays?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  if (!Array.isArray(body.postIds) || body.postIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Daftar ID draft tidak valid." }, { status: 400 });
  }
  const postIds = [...new Set(body.postIds as string[])];
  const startAt = typeof body.startAt === "string" ? new Date(body.startAt) : null;
  const intervalDays = typeof body.intervalDays === "number" ? body.intervalDays : NaN;

  if (postIds.length === 0 || postIds.length > MAX_BULK_POSTS) {
    return NextResponse.json({ error: `Pilih 1 sampai ${MAX_BULK_POSTS} draft.` }, { status: 400 });
  }
  if (postIds.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
    return NextResponse.json({ error: "Terdapat ID artikel yang tidak valid." }, { status: 400 });
  }
  if (!startAt || !Number.isFinite(startAt.getTime()) || startAt <= new Date()) {
    return NextResponse.json({ error: "Waktu mulai harus valid dan berada di masa depan." }, { status: 400 });
  }
  if (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365) {
    return NextResponse.json({ error: "Jarak antarartikel harus 1 sampai 365 hari." }, { status: 400 });
  }

  const eligiblePosts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.app_id, APP_ID),
      eq(blogPosts.isPublished, false),
      isNull(blogPosts.scheduledAt),
      isNull(blogPosts.deletedAt),
      inArray(blogPosts.id, postIds),
    ),
    columns: { id: true },
  });

  if (eligiblePosts.length !== postIds.length) {
    return NextResponse.json({ error: "Sebagian artikel sudah dijadwalkan, diterbitkan, dihapus, atau tidak ditemukan. Muat ulang daftar draft." }, { status: 409 });
  }

  const postIdSet = new Set(postIds);
  const [linkedPlans, scheduledPosts] = await db.transaction(async (tx) => {
    const scheduled = [];
    for (const [index, postId] of postIds.entries()) {
      const scheduledAt = new Date(startAt.getTime() + index * intervalDays * 24 * 60 * 60 * 1000);
      const [post] = await tx.update(blogPosts)
        .set({ scheduledAt, updatedAt: new Date() })
        .where(and(
          eq(blogPosts.id, postId),
          eq(blogPosts.app_id, APP_ID),
          eq(blogPosts.isPublished, false),
          isNull(blogPosts.scheduledAt),
          isNull(blogPosts.deletedAt),
        ))
        .returning({ id: blogPosts.id, scheduledAt: blogPosts.scheduledAt });
      if (!post) throw new Error("Draft berubah saat bulk schedule diproses. Muat ulang daftar draft.");
      scheduled.push(post);
    }

    const plans = await tx.update(blogContentPlans)
      .set({ status: "scheduled", updatedAt: new Date() })
      .where(and(
        eq(blogContentPlans.app_id, APP_ID),
        inArray(blogContentPlans.linkedPostId, postIds),
      ))
      .returning({ linkedPostId: blogContentPlans.linkedPostId });

    return [plans, scheduled] as const;
  });

  const planLinkedPostIds = new Set(linkedPlans.map((plan) => plan.linkedPostId).filter(Boolean));
  return NextResponse.json({
    scheduled: scheduledPosts.length,
    posts: scheduledPosts.map((post) => ({
      id: post.id,
      scheduledAt: post.scheduledAt?.toISOString(),
      linkedToContentPlan: planLinkedPostIds.has(post.id) && postIdSet.has(post.id),
    })),
  });
}

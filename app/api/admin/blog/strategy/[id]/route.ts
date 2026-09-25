import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogContentPlans } from "@/db/schema";
import { isAdmin } from "@/lib/admin";
import { getWordTarget } from "@/lib/blog-content-strategy";

const APP_ID = "balikin_id";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  for (const field of ["title", "focusKeyword", "secondaryKeywords", "searchIntent", "articleType", "brief", "cta", "priority", "status", "notes", "linkedPostId"]) {
    if (body[field] !== undefined) updates[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
  }
  if (typeof body.targetPublishDate === "string") updates.targetPublishDate = body.targetPublishDate ? new Date(body.targetPublishDate) : null;
  if (typeof body.parentPlanId === "string" || body.parentPlanId === null) updates.parentPlanId = body.parentPlanId;
  if (typeof body.clusterId === "string") updates.clusterId = body.clusterId;
  if (typeof body.targetMinWords === "number") updates.targetMinWords = body.targetMinWords;
  if (typeof body.targetMaxWords === "number") updates.targetMaxWords = body.targetMaxWords;
  if (typeof body.articleType === "string" && body.targetMinWords === undefined && body.targetMaxWords === undefined) {
    const target = getWordTarget(body.articleType);
    updates.targetMinWords = target.min;
    updates.targetMaxWords = target.max;
  }

  if (typeof updates.targetMinWords === "number" && typeof updates.targetMaxWords === "number" && updates.targetMaxWords < updates.targetMinWords) {
    return NextResponse.json({ error: "Target kata tidak valid." }, { status: 400 });
  }

  const [plan] = await db.update(blogContentPlans)
    .set(updates)
    .where(and(eq(blogContentPlans.id, id), eq(blogContentPlans.app_id, APP_ID)))
    .returning();
  if (!plan) return NextResponse.json({ error: "Rencana artikel tidak ditemukan." }, { status: 404 });
  return NextResponse.json(plan);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [plan] = await db.delete(blogContentPlans)
    .where(and(eq(blogContentPlans.id, id), eq(blogContentPlans.app_id, APP_ID)))
    .returning({ id: blogContentPlans.id });
  if (!plan) return NextResponse.json({ error: "Rencana artikel tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { isAdmin } from "@/lib/admin";

const APP_ID = "balikin_id";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [clusters, plans] = await Promise.all([
    db.select().from(blogContentClusters).where(eq(blogContentClusters.app_id, APP_ID)).orderBy(asc(blogContentClusters.name)),
    db.select().from(blogContentPlans).where(eq(blogContentPlans.app_id, APP_ID)).orderBy(asc(blogContentPlans.targetPublishDate), asc(blogContentPlans.title)),
  ]);

  return NextResponse.json({ clusters, plans });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as Record<string, unknown>;
  const type = body.type === "cluster" ? "cluster" : "plan";

  if (type === "cluster") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
    if (!name || !slug) return NextResponse.json({ error: "Nama dan slug cluster wajib diisi." }, { status: 400 });

    const [cluster] = await db.insert(blogContentClusters).values({
      app_id: APP_ID,
      name,
      slug: slug.replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
      description: typeof body.description === "string" ? body.description.trim() : null,
      primaryKeyword: typeof body.primaryKeyword === "string" ? body.primaryKeyword.trim() : null,
      targetArticles: typeof body.targetArticles === "number" ? body.targetArticles : 12,
    }).returning();
    return NextResponse.json(cluster, { status: 201 });
  }

  const clusterId = typeof body.clusterId === "string" ? body.clusterId : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const focusKeyword = typeof body.focusKeyword === "string" ? body.focusKeyword.trim() : "";
  if (!clusterId || !title || !focusKeyword) {
    return NextResponse.json({ error: "Cluster, judul, dan focus keyword wajib diisi." }, { status: 400 });
  }

  const [plan] = await db.insert(blogContentPlans).values({
    app_id: APP_ID,
    clusterId,
    parentPlanId: typeof body.parentPlanId === "string" ? body.parentPlanId : null,
    title,
    focusKeyword,
    secondaryKeywords: typeof body.secondaryKeywords === "string" ? body.secondaryKeywords.trim() : null,
    searchIntent: typeof body.searchIntent === "string" ? body.searchIntent : "informational",
    articleType: typeof body.articleType === "string" ? body.articleType : "supporting",
    brief: typeof body.brief === "string" ? body.brief.trim() : null,
    cta: typeof body.cta === "string" ? body.cta.trim() : null,
    priority: typeof body.priority === "string" ? body.priority : "medium",
    status: typeof body.status === "string" ? body.status : "planned",
    targetPublishDate: typeof body.targetPublishDate === "string" && body.targetPublishDate ? new Date(body.targetPublishDate) : null,
  }).returning();

  return NextResponse.json(plan, { status: 201 });
}

import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { BRAND_PILLARS, getWordTarget } from "@/lib/blog-content-strategy";

const APP_ID = "balikin_id";
const ARTICLE_TYPES = ["pillar", "supporting", "commercial"] as const;
const SEARCH_INTENTS = ["informational", "commercial", "transactional", "navigational"] as const;

type Suggestion = {
  title: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  articleType: (typeof ARTICLE_TYPES)[number];
  searchIntent: (typeof SEARCH_INTENTS)[number];
  brandPillar: string;
  brief: string;
  cta: string;
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, " ").trim();
}

function parseSuggestion(value: unknown): Suggestion | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.title !== "string" || !item.title.trim() || item.title.trim().length > 200) return null;
  if (typeof item.focusKeyword !== "string" || !item.focusKeyword.trim() || item.focusKeyword.trim().length > 120) return null;
  if (typeof item.articleType !== "string" || !ARTICLE_TYPES.includes(item.articleType as Suggestion["articleType"])) return null;
  if (typeof item.searchIntent !== "string" || !SEARCH_INTENTS.includes(item.searchIntent as Suggestion["searchIntent"])) return null;
  if (typeof item.brandPillar !== "string" || !BRAND_PILLARS.some((pillar) => pillar.value === item.brandPillar)) return null;
  if (typeof item.brief !== "string" || !item.brief.trim() || typeof item.cta !== "string" || !item.cta.trim()) return null;

  const secondaryKeywords = Array.isArray(item.secondaryKeywords)
    ? item.secondaryKeywords.filter((keyword): keyword is string => typeof keyword === "string").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 5)
    : [];

  return {
    title: item.title.trim(),
    focusKeyword: item.focusKeyword.trim(),
    secondaryKeywords,
    articleType: item.articleType as Suggestion["articleType"],
    searchIntent: item.searchIntent as Suggestion["searchIntent"],
    brandPillar: item.brandPillar,
    brief: item.brief.trim().slice(0, 2000),
    cta: item.cta.trim().slice(0, 500),
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { clusterId?: unknown; parentPlanId?: unknown; suggestions?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body tidak valid." }, { status: 400 });
  }

  const clusterId = typeof body.clusterId === "string" ? body.clusterId : "";
  const parentPlanId = typeof body.parentPlanId === "string" && body.parentPlanId ? body.parentPlanId : null;
  if (!clusterId || !Array.isArray(body.suggestions) || body.suggestions.length < 1 || body.suggestions.length > 5) {
    return NextResponse.json({ error: "Cluster dan 1 sampai 5 usulan wajib dipilih." }, { status: 400 });
  }

  const suggestions = body.suggestions.map(parseSuggestion);
  if (suggestions.some((suggestion) => suggestion === null)) {
    return NextResponse.json({ error: "Ada usulan dengan data yang tidak valid." }, { status: 400 });
  }
  const validSuggestions = suggestions as Suggestion[];

  const [cluster, existingPlans] = await Promise.all([
    db.query.blogContentClusters.findFirst({
      where: and(eq(blogContentClusters.id, clusterId), eq(blogContentClusters.app_id, APP_ID), eq(blogContentClusters.isActive, true)),
      columns: { id: true },
    }),
    db.query.blogContentPlans.findMany({
      where: and(eq(blogContentPlans.clusterId, clusterId), eq(blogContentPlans.app_id, APP_ID)),
      columns: { id: true, title: true, focusKeyword: true, articleType: true },
    }),
  ]);
  if (!cluster) return NextResponse.json({ error: "Cluster tidak ditemukan atau tidak aktif." }, { status: 404 });

  if (parentPlanId && !existingPlans.some((plan) => plan.id === parentPlanId && plan.articleType === "pillar")) {
    return NextResponse.json({ error: "Pillar induk tidak valid untuk cluster ini." }, { status: 400 });
  }

  const existingTitles = new Set(existingPlans.map((plan) => normalize(plan.title)));
  const existingKeywords = new Set(existingPlans.map((plan) => normalize(plan.focusKeyword)));
  const existingPillars = existingPlans.filter((plan) => plan.articleType === "pillar");
  const resolvedExistingParentPlanId = parentPlanId || (existingPillars.length === 1 ? existingPillars[0].id : null);
  const accepted: Suggestion[] = [];
  let skippedDuplicates = 0;
  for (const suggestion of validSuggestions) {
    const titleKey = normalize(suggestion.title);
    const keywordKey = normalize(suggestion.focusKeyword);
    if (existingTitles.has(titleKey) || existingKeywords.has(keywordKey)) {
      skippedDuplicates += 1;
      continue;
    }
    existingTitles.add(titleKey);
    existingKeywords.add(keywordKey);
    accepted.push(suggestion);
  }

  if (accepted.length === 0) return NextResponse.json({ created: [], skippedDuplicates });

  const newPillarIndex = accepted.findIndex((suggestion) => suggestion.articleType === "pillar");
  const newPillarId = newPillarIndex >= 0 ? randomUUID() : null;
  const values = accepted.map((suggestion, index) => {
    const id = index === newPillarIndex && newPillarId ? newPillarId : randomUUID();
    const target = getWordTarget(suggestion.articleType);
    const resolvedParentId = suggestion.articleType === "pillar" ? null : resolvedExistingParentPlanId || newPillarId;
    return {
      id,
      app_id: APP_ID,
      clusterId,
      parentPlanId: resolvedParentId,
      title: suggestion.title,
      focusKeyword: suggestion.focusKeyword,
      secondaryKeywords: suggestion.secondaryKeywords.join(", ") || null,
      searchIntent: suggestion.searchIntent,
      articleType: suggestion.articleType,
      brandPillar: suggestion.brandPillar,
      targetMinWords: target.min,
      targetMaxWords: target.max,
      brief: suggestion.brief,
      cta: suggestion.cta,
      priority: suggestion.articleType === "pillar" ? "high" : "medium",
      status: "planned",
    };
  });

  const created = await db.insert(blogContentPlans).values(values).returning();
  return NextResponse.json({ created, skippedDuplicates }, { status: 201 });
}

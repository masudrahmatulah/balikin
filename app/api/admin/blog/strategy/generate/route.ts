import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { BRAND_PILLARS, getWordTarget } from "@/lib/blog-content-strategy";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const APP_ID = "balikin_id";
const ARTICLE_TYPES = ["pillar", "supporting", "commercial"] as const;
const SEARCH_INTENTS = ["informational", "commercial", "transactional", "navigational"] as const;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      minItems: 3,
      maxItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          focusKeyword: { type: Type.STRING },
          secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          articleType: { type: Type.STRING, enum: [...ARTICLE_TYPES] },
          searchIntent: { type: Type.STRING, enum: [...SEARCH_INTENTS] },
          brandPillar: { type: Type.STRING, enum: BRAND_PILLARS.map((pillar) => pillar.value) },
          brief: { type: Type.STRING },
          cta: { type: Type.STRING },
        },
        required: ["title", "focusKeyword", "secondaryKeywords", "articleType", "searchIntent", "brandPillar", "brief", "cta"],
      },
    },
  },
  required: ["suggestions"],
} as const;

function getGeminiApiKeys() {
  const numberedKeys = [1, 2, 3]
    .map((number) => process.env[`GEMINI_API_KEY_${number}`])
    .filter((key): key is string => Boolean(key?.trim()));
  return numberedKeys.length > 0 ? numberedKeys : process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : [];
}

function getGeminiModels() {
  return [...new Set([
    process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
  ])];
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await auth.api.getSession({ headers: await headers() });
    const rateLimit = await checkBlogGenerateRateLimit(`blogstrategy:${session?.user?.id ?? "unknown"}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Batas generate AI tercapai. Coba lagi nanti." },
        { status: 429, headers: getRateLimitHeaders(rateLimit) },
      );
    }

    const body = await request.json() as { clusterId?: unknown; count?: unknown; parentPlanId?: unknown };
    const clusterId = typeof body.clusterId === "string" ? body.clusterId : "";
    const count = typeof body.count === "number" && Number.isInteger(body.count) ? body.count : 5;
    const requestedParentPlanId = typeof body.parentPlanId === "string" ? body.parentPlanId : null;
    if (!clusterId || count < 3 || count > 5) {
      return NextResponse.json({ error: "Pilih cluster dan jumlah usulan 3 sampai 5." }, { status: 400 });
    }

    const [cluster, existingPlans] = await Promise.all([
      db.query.blogContentClusters.findFirst({
        where: and(eq(blogContentClusters.id, clusterId), eq(blogContentClusters.app_id, APP_ID), eq(blogContentClusters.isActive, true)),
      }),
      db.query.blogContentPlans.findMany({
        where: and(eq(blogContentPlans.clusterId, clusterId), eq(blogContentPlans.app_id, APP_ID)),
        columns: { id: true, title: true, focusKeyword: true, articleType: true, brandPillar: true },
        orderBy: [asc(blogContentPlans.title)],
      }),
    ]);
    if (!cluster) return NextResponse.json({ error: "Cluster tidak ditemukan atau tidak aktif." }, { status: 404 });

    const pillarPlans = existingPlans.filter((plan) => plan.articleType === "pillar");
    if (requestedParentPlanId && !pillarPlans.some((plan) => plan.id === requestedParentPlanId)) {
      return NextResponse.json({ error: "Pillar induk tidak valid untuk cluster ini." }, { status: 400 });
    }
    const selectedParentPillar = requestedParentPlanId
      ? pillarPlans.find((plan) => plan.id === requestedParentPlanId)
      : pillarPlans.length === 1 ? pillarPlans[0] : null;

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });

    const existingPlanContext = existingPlans.length > 0
      ? existingPlans.map((plan) => `- [${plan.articleType}] ${plan.title} | focus keyword: ${plan.focusKeyword} | brand pillar: ${plan.brandPillar || "-"}`).join("\n")
      : "Belum ada rencana artikel pada cluster ini.";
    const prompt = `
Anda adalah strategist SEO dan editor konten Balikin. Buat tepat ${count} usulan rencana artikel untuk cluster berikut.

CLUSTER: ${cluster.name}
KEYWORD UTAMA CLUSTER: ${cluster.primaryKeyword || "belum ditentukan"}
DESKRIPSI CLUSTER: ${cluster.description || "Tidak tersedia"}
PILLAR INDUK PILIHAN: ${selectedParentPillar ? `${selectedParentPillar.title} (keyword: ${selectedParentPillar.focusKeyword})` : "tidak ditentukan; jika membuat supporting, kaitkan dengan pillar cluster yang ada secara konseptual"}

ARTIKEL YANG SUDAH DIRENCANAKAN (hindari duplikasi topik dan keyword):
${existingPlanContext}

PILAR BRAND YANG BOLEH DIPILIH:
${BRAND_PILLARS.map((pillar) => `- ${pillar.value}: ${pillar.label}`).join("\n")}

ATURAN:
- Buat tepat ${count} ide yang berbeda, relevan dengan cluster, pembaca Indonesia, dan punya search intent yang jelas.
- Hindari judul, focus keyword, dan sudut bahasan yang sama atau sangat mirip dengan daftar rencana yang sudah ada.
- Variasikan tipe pillar, supporting, dan commercial hanya jika struktur cluster membutuhkannya; jangan membuat pillar duplikat jika cluster sudah memiliki pillar.
- Supporting dan commercial harus menjadi subtopik spesifik yang melengkapi pillar cluster, bukan mengulang keseluruhan pillar.
- focusKeyword harus berupa frasa pencarian spesifik, bukan daftar kata.
- secondaryKeywords berisi 2-5 frasa terkait.
- brief berisi arahan isi konkret, fokus pembaca, dan subtopik utama; jangan mengarang fakta produk.
- cta harus halus dan relevan; jangan membuat klaim harga, stok, garansi, atau fitur yang tidak diberikan.
- Gunakan articleType hanya: ${ARTICLE_TYPES.join(", ")}.
- Gunakan searchIntent hanya: ${SEARCH_INTENTS.join(", ")}.
- brandPillar harus persis salah satu nilai yang diizinkan.
- Kembalikan JSON saja sesuai schema.
`.trim();

    let lastError: unknown;
    for (const model of getGeminiModels()) {
      for (let index = 0; index < apiKeys.length; index += 1) {
        try {
          const response = await new GoogleGenAI({ apiKey: apiKeys[index] }).models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.7, maxOutputTokens: 2800, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
          });
          const parsed = JSON.parse(response.text?.trim() || "{}") as { suggestions?: unknown };
          if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length !== count) throw new Error("AI returned an invalid suggestion count");

          const knownTitles = new Set(existingPlans.map((plan) => normalize(plan.title)));
          const knownKeywords = new Set(existingPlans.map((plan) => normalize(plan.focusKeyword)));
          const suggestions = parsed.suggestions.map((entry) => {
            if (!entry || typeof entry !== "object") throw new Error("AI returned an invalid suggestion");
            const item = entry as Record<string, unknown>;
            const title = typeof item.title === "string" ? item.title.trim() : "";
            const focusKeyword = typeof item.focusKeyword === "string" ? item.focusKeyword.trim() : "";
            const articleType = typeof item.articleType === "string" ? item.articleType : "";
            const searchIntent = typeof item.searchIntent === "string" ? item.searchIntent : "";
            const brandPillar = typeof item.brandPillar === "string" ? item.brandPillar : "";
            const secondaryKeywords = Array.isArray(item.secondaryKeywords)
              ? item.secondaryKeywords.filter((keyword): keyword is string => typeof keyword === "string").map((keyword) => keyword.trim()).filter(Boolean).slice(0, 5)
              : [];
            if (!title || title.length > 200 || !focusKeyword || focusKeyword.length > 120) throw new Error("AI returned a missing or overlong title/keyword");
            if (!ARTICLE_TYPES.includes(articleType as typeof ARTICLE_TYPES[number])) throw new Error("AI returned an invalid article type");
            if (!SEARCH_INTENTS.includes(searchIntent as typeof SEARCH_INTENTS[number])) throw new Error("AI returned an invalid search intent");
            if (!BRAND_PILLARS.some((pillar) => pillar.value === brandPillar)) throw new Error("AI returned an invalid brand pillar");
            if (typeof item.brief !== "string" || !item.brief.trim() || typeof item.cta !== "string" || !item.cta.trim()) throw new Error("AI returned an incomplete content brief");

            const normalizedTitle = normalize(title);
            const normalizedKeyword = normalize(focusKeyword);
            const duplicate = knownTitles.has(normalizedTitle) || knownKeywords.has(normalizedKeyword);
            knownTitles.add(normalizedTitle);
            knownKeywords.add(normalizedKeyword);
            const wordTarget = getWordTarget(articleType);
            return {
              title,
              focusKeyword,
              secondaryKeywords,
              articleType,
              searchIntent,
              brandPillar,
              brief: item.brief.trim().slice(0, 2000),
              cta: item.cta.trim().slice(0, 500),
              targetMinWords: wordTarget.min,
              targetMaxWords: wordTarget.max,
              isDuplicate: duplicate,
            };
          });

          return NextResponse.json({ suggestions, duplicateCount: suggestions.filter((suggestion) => suggestion.isDuplicate).length });
        } catch (error) {
          lastError = error;
          console.warn(`[Blog Strategy AI] Model ${model}, key ${index + 1} failed; trying fallback.`);
        }
      }
    }

    console.error("[Blog Strategy AI] All attempts failed:", lastError);
    return NextResponse.json({ error: "Usulan rencana artikel gagal dibuat. Silakan coba lagi." }, { status: 502 });
  } catch (error) {
    console.error("[Blog Strategy AI] Request failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat usulan rencana." }, { status: 500 });
  }
}

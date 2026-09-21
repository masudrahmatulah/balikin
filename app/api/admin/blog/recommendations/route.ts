import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";

const RECOMMENDATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      minItems: 5,
      maxItems: 5,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          keyword: { type: Type.STRING },
          angle: { type: Type.STRING },
        },
        required: ["title", "keyword", "angle"],
      },
    },
  },
  required: ["recommendations"],
} as const;

function getGeminiApiKeys() {
  const numberedKeys = [1, 2, 3]
    .map((number) => process.env[`GEMINI_API_KEY_${number}`])
    .filter((key): key is string => Boolean(key?.trim()));

  return numberedKeys.length > 0
    ? numberedKeys
    : process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : [];
}

function getGeminiModels() {
  return [...new Set([
    process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
  ])];
}

async function getProductContext() {
  try {
    return await fs.readFile(
      path.join(process.cwd(), "content", "helpdesk", "products-and-specifications.md"),
      "utf8",
    );
  } catch {
    return "Knowledge base produk tidak tersedia.";
  }
}

export async function POST() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const generateLimit = await checkBlogGenerateRateLimit(`bloggen:${session?.user?.id ?? "unknown"}`);
    if (!generateLimit.allowed) {
      return NextResponse.json(
        { error: "Batas generate tercapai. Coba lagi 1 jam lagi.", retryAfter: generateLimit.retryAfter },
        { status: 429, headers: { ...getRateLimitHeaders(generateLimit), "Content-Type": "application/json" } },
      );
    }

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });
    }

    const today = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date());
    const prompt = `
Anda adalah editor strategi konten resmi Balikin, platform Smart Lost & Found QR Tag Indonesia.
Buat tepat 5 rekomendasi artikel blog untuk diterbitkan hari ini (${today}).

Aturan wajib:
- Setiap ide harus berbeda, praktis, dan relevan dengan pembaca Indonesia.
- Prioritaskan topik keamanan barang, QR code, lost and found, privasi, traveling, keluarga, usaha kecil, dan edukasi produk Balikin.
- Jangan mengulang judul atau keyword.
- Jangan membuat klaim produk, harga, atau fitur yang tidak ada di knowledge base.
- title adalah judul artikel yang siap dipilih.
- keyword adalah satu keyword utama SEO.
- angle menjelaskan sudut pandang artikel dalam satu kalimat.

Knowledge base produk:
${await getProductContext()}
`.trim();

    let lastError: unknown;
    for (const model of getGeminiModels()) {
      for (let index = 0; index < apiKeys.length; index += 1) {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKeys[index] });
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              temperature: 0.8,
              maxOutputTokens: 1600,
              responseMimeType: "application/json",
              responseSchema: RECOMMENDATION_SCHEMA,
            },
          });

          const parsed = JSON.parse(response.text?.trim() || "{}");
          const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
          if (recommendations.length !== 5 || recommendations.some((item) => (
            typeof item?.title !== "string" ||
            typeof item?.keyword !== "string" ||
            typeof item?.angle !== "string"
          ))) {
            throw new Error("Gemini returned an invalid recommendation list");
          }

          return NextResponse.json({ recommendations });
        } catch (error) {
          lastError = error;
          console.warn(`[Blog AI Recommendations] Model ${model}, key ${index + 1} failed; trying fallback.`);
        }
      }
    }

    console.error("[Blog AI Recommendations] All attempts failed:", lastError);
    return NextResponse.json({ error: "Rekomendasi artikel gagal dibuat. Silakan coba lagi." }, { status: 502 });
  } catch (error) {
    console.error("[Blog AI Recommendations] Request failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat rekomendasi." }, { status: 500 });
  }
}

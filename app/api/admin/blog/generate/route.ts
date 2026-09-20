import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";

const BLOG_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    content: { type: Type.STRING },
    slug: { type: Type.STRING },
    metaDescription: { type: Type.STRING },
    metaKeywords: { type: Type.STRING },
    focusKeyword: { type: Type.STRING },
  },
  required: [
    "title",
    "summary",
    "content",
    "slug",
    "metaDescription",
    "metaKeywords",
    "focusKeyword",
  ],
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

async function getApprovedProductContext() {
  try {
    return await fs.readFile(
      path.join(process.cwd(), "content", "helpdesk", "products-and-specifications.md"),
      "utf8",
    );
  } catch {
    return "Knowledge base produk tidak tersedia. Jangan membuat klaim harga atau spesifikasi produk.";
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Budget AI per admin: cegah retry-loop bakar kuota Gemini.
    const session = await auth.api.getSession({ headers: await headers() });
    const generateLimit = await checkBlogGenerateRateLimit(`bloggen:${session?.user?.id ?? "unknown"}`);
    if (!generateLimit.allowed) {
      return NextResponse.json(
        { error: "Batas generate tercapai. Coba lagi 1 jam lagi.", retryAfter: generateLimit.retryAfter },
        { status: 429, headers: { ...getRateLimitHeaders(generateLimit), "Content-Type": "application/json" } },
      );
    }

    const body = await request.json() as { topic?: unknown; keyword?: unknown };
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const keyword = typeof body.keyword === "string" ? body.keyword.trim().slice(0, 100) : "";

    if (topic.length < 5 || topic.length > 200) {
      return NextResponse.json({ error: "Topik harus berisi 5-200 karakter." }, { status: 400 });
    }

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });
    }

    const productContext = await getApprovedProductContext();
    const prompt = `
Anda adalah editor konten resmi Balikin, platform Smart Lost & Found QR Tag Indonesia.
Buat satu artikel blog berbahasa Indonesia berdasarkan topik berikut.

Topik: ${topic}
Keyword utama: ${keyword || "tentukan keyword yang paling relevan"}

Aturan wajib:
- Hasilkan artikel yang berguna, spesifik, dan mudah dipindai pembaca.
- Gunakan Markdown untuk content dengan heading, paragraf, list, dan contoh yang relevan.
- Jangan mengarang harga, fitur, garansi, kebijakan, angka pengguna, atau klaim teknis.
- Jika membahas produk Balikin, gunakan hanya fakta dari knowledge base di bawah.
- Jika topik meminta fakta yang tidak tersedia, tulis artikel edukatif umum dan jangan mengklaim fakta tersebut sebagai fakta Balikin.
- Jangan menyebut bahwa artikel dibuat oleh AI.
- Summary harus 50-500 karakter.
- Content harus minimal 100 karakter.
- Slug hanya boleh berisi huruf kecil, angka, tanda hubung, atau underscore.
- Meta description maksimal 300 karakter.
- Meta keywords berupa daftar dipisahkan koma.

Knowledge base produk:
${productContext}
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
              temperature: 0.5,
              maxOutputTokens: 3000,
              responseMimeType: "application/json",
              responseSchema: BLOG_RESPONSE_SCHEMA,
            },
          });

          const rawText = response.text?.trim();
          if (!rawText) throw new Error("Gemini returned an empty response");

          const generated = JSON.parse(rawText) as Record<string, unknown>;
          const stringFields = [
            "title",
            "summary",
            "content",
            "slug",
            "metaDescription",
            "metaKeywords",
            "focusKeyword",
          ];
          if (stringFields.some((field) => typeof generated[field] !== "string" || !generated[field])) {
            throw new Error("Gemini returned an incomplete article");
          }

          if (String(generated.summary).length < 50 || String(generated.content).length < 100) {
            throw new Error("Gemini returned content that is too short");
          }

          const normalizedSlug = String(generated.slug)
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 100);
          if (!normalizedSlug) throw new Error("Gemini returned an invalid slug");

          return NextResponse.json({
            title: generated.title,
            summary: generated.summary,
            content: generated.content,
            slug: normalizedSlug,
            metaDescription: generated.metaDescription,
            metaKeywords: generated.metaKeywords,
            focusKeyword: generated.focusKeyword,
          });
        } catch (error) {
          lastError = error;
          console.warn(`[Blog AI] Model ${model}, key ${index + 1} failed; trying fallback.`);
        }
      }
    }

    console.error("[Blog AI] All generation attempts failed:", lastError);
    return NextResponse.json({ error: "Artikel gagal dibuat. Silakan coba lagi." }, { status: 502 });
  } catch (error) {
    console.error("[Blog AI] Request failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat artikel." }, { status: 500 });
  }
}

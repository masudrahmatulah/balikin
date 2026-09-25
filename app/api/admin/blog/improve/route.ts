import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { countKeywordOccurrences, ensureSlugContainsKeyword } from "@/lib/blog-seo";

export const runtime = "nodejs";

const RESPONSE_SCHEMA = {
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
  required: ["title", "summary", "content", "slug", "metaDescription", "metaKeywords", "focusKeyword"],
} as const;

const PRODUCT_URLS = ["/pricing", "/stickers", "/stickers/checkout", "/sign-up", "/how-it-works"];

function getKeys() {
  const numbered = [1, 2, 3]
    .map((number) => process.env[`GEMINI_API_KEY_${number}`])
    .filter((key): key is string => Boolean(key?.trim()));
  return numbered.length > 0 ? numbered : process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : [];
}

function getModels() {
  return [...new Set([process.env.GEMINI_MODEL || "gemini-flash-lite-latest", process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite", "gemini-flash-lite-latest"])] as string[];
}

function countWords(value: string) {
  return value.replace(/[`*_#>\[\]()-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function hasProductLink(content: string) {
  return PRODUCT_URLS.some((url) => content.includes(`](${url}`));
}

async function getContext() {
  const [productContext, posts] = await Promise.all([
    fs.readFile(path.join(process.cwd(), "content", "helpdesk", "products-and-specifications.md"), "utf8").catch(() => "Knowledge base produk tidak tersedia."),
    db.query.blogPosts.findMany({
      where: and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)),
      columns: { title: true, slug: true, summary: true, focusKeyword: true, metaKeywords: true },
      orderBy: (table, { desc }) => [desc(table.publishedAt)],
      limit: 50,
    }),
  ]);

  const internalLinks = posts.map((post) => `- ${post.title}\n  URL: /blog/${post.slug}\n  Ringkasan: ${post.summary}\n  Keyword: ${[post.focusKeyword, post.metaKeywords].filter(Boolean).join(", ") || "-"}`).join("\n");
  return { productContext, internalLinks: internalLinks || "Belum ada artikel published lain." };
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await auth.api.getSession({ headers: await headers() });
    const limit = await checkBlogGenerateRateLimit(`blogimprove:${session?.user?.id ?? "unknown"}`);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Batas perbaikan AI tercapai. Coba lagi 1 jam lagi." }, { status: 429, headers: getRateLimitHeaders(limit) });
    }

    const body = await request.json() as Record<string, unknown>;
    const instruction = typeof body.instruction === "string" ? body.instruction.trim().slice(0, 2000) : "";
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 300) : "";
    const summary = typeof body.summary === "string" ? body.summary.trim().slice(0, 1000) : "";
    const content = typeof body.content === "string" ? body.content.slice(0, 50000) : "";
    const slug = typeof body.slug === "string" ? body.slug.trim().slice(0, 120) : "";
    const targetMinWords = typeof body.targetMinWords === "number" && body.targetMinWords >= 300 && body.targetMinWords <= 5000 ? Math.floor(body.targetMinWords) : 300;
    const targetMaxWords = typeof body.targetMaxWords === "number" && body.targetMaxWords >= targetMinWords && body.targetMaxWords <= 6000 ? Math.floor(body.targetMaxWords) : null;
    if (instruction.length < 5) return NextResponse.json({ error: "Perintah perbaikan minimal 5 karakter." }, { status: 400 });
    if (!title || !content) return NextResponse.json({ error: "Artikel yang akan diperbaiki belum lengkap." }, { status: 400 });

    const apiKeys = getKeys();
    if (apiKeys.length === 0) return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });
    const context = await getContext();
    const prompt = `
Anda adalah editor senior blog Balikin. Perbaiki artikel Markdown berikut berdasarkan perintah editor.

PERINTAH EDITOR:
${instruction}

ARTIKEL SAAT INI:
Judul: ${title}
Slug: ${slug}
Summary: ${summary}
Content:
${content}

ATURAN:
- Kembalikan seluruh field artikel dalam JSON sesuai schema, bukan penjelasan tambahan.
- Terapkan perintah editor dengan cermat, tetapi pertahankan fakta yang sudah benar.
- Gunakan Markdown dengan satu baris kosong antar paragraf.
- Content harus minimal ${targetMinWords} kata, bukan jumlah karakter.${targetMaxWords ? ` Target ideal: ${targetMinWords}-${targetMaxWords} kata.` : ""}
- Jika perintah meminta memperpanjang, PERTAHANKAN seluruh isi artikel yang sudah ada dan TAMBAHKAN bagian baru. Jangan meringkas, menghapus, atau menimpa paragraf lama dengan versi lebih pendek.
- Informatif, natural, dan mudah dipindai.
- Pertahankan atau tambahkan soft-selling Balikin yang relevan, bukan hard-selling.
- Wajib ada 1 link produk Balikin yang natural. Link yang diperbolehkan: ${PRODUCT_URLS.join(", ")}.
- Jika artikel belum memiliki bagian itu, tambahkan heading "## Solusi Praktis dengan Balikin".
- Gunakan hanya fakta dari knowledge base produk berikut. Jangan mengarang harga, fitur, stok, garansi, atau klaim teknis.
- Jika memperbaiki SEO, meta description 120-160 karakter dan meta keywords berupa daftar koma.
- Focus keyword wajib digunakan persis minimal 2 kali secara natural di dalam content.
- Jangan menyebut bahwa artikel dibuat atau diperbaiki oleh AI.
- Link artikel lain hanya boleh memakai URL yang tersedia pada daftar internal link.

KNOWLEDGE BASE PRODUK:
${context.productContext}

DAFTAR INTERNAL LINK:
${context.internalLinks}
`.trim();

    let lastError: unknown;
    for (const model of getModels()) {
      for (let index = 0; index < apiKeys.length; index += 1) {
        try {
          const response = await new GoogleGenAI({ apiKey: apiKeys[index] }).models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.4, maxOutputTokens: 8000, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
          });
          const generated = JSON.parse(response.text?.trim() || "{}") as Record<string, unknown>;
          const fields = ["title", "summary", "content", "slug", "metaDescription", "metaKeywords", "focusKeyword"];
           if (fields.some((field) => typeof generated[field] !== "string" || !generated[field])) throw new Error("AI returned incomplete article");
           if (countWords(String(generated.content)) < 300) throw new Error("AI returned fewer than 300 words");
           if (!hasProductLink(String(generated.content))) throw new Error("AI did not include a valid product link");
           const focusKeyword = String(generated.focusKeyword).trim().replace(/\s+/g, " ");
           if (countKeywordOccurrences(String(generated.content), focusKeyword) < 2) {
             throw new Error("AI returned content with fewer than 2 focus keyword occurrences");
           }
            return NextResponse.json({
              ...generated,
              slug: ensureSlugContainsKeyword(String(generated.slug), focusKeyword),
              focusKeyword,
              wordCount: countWords(String(generated.content)),
              targetMinWords,
              targetMaxWords,
            });
        } catch (error) {
          lastError = error;
          console.warn(`[Blog AI Improve] Model ${model}, key ${index + 1} failed; trying fallback.`);
        }
      }
    }

    console.error("[Blog AI Improve] All attempts failed:", lastError);
    return NextResponse.json({ error: "Artikel gagal diperbaiki. Periksa perintah lalu coba lagi." }, { status: 502 });
  } catch (error) {
    console.error("[Blog AI Improve] Request failed:", error);
    return NextResponse.json({ error: "Terjadi kesalahan saat memperbaiki artikel." }, { status: 500 });
  }
}

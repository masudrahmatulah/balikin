import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checkBlogGenerateRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { blogContentPlans, blogPosts } from "@/db/schema";
import { countKeywordOccurrences, ensureSlugContainsKeyword } from "@/lib/blog-seo";

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

function countWords(value: string) {
  return value
    .replace(/[`*_#>\[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

type InternalLink = {
  title: string;
  url: string;
  summary: string;
  keywords: string;
};

const PRODUCT_LINK_ALLOWLIST = [
  "/pricing",
  "/stickers",
  "/stickers/checkout",
  "/sign-up",
  "/how-it-works",
] as const;

function isAllowedProductUrl(url: string): boolean {
  return PRODUCT_LINK_ALLOWLIST.some(
    (allowed) => url === allowed || url.startsWith(`${allowed}/`) || url.startsWith(`${allowed}?`),
  );
}

function pickFallbackProductUrl(topic: string, keyword: string): string {
  if (/gratis|free|coba|pemula|mencoba/i.test(`${topic} ${keyword}`)) {
    return "/sign-up";
  }
  return "/stickers";
}

function rankInternalLinks(links: InternalLink[], topic: string, keyword: string) {
  const queryTokens = new Set(
    `${topic} ${keyword}`
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );

  return [...links]
    .map((link, index) => {
      const documentTokens = `${link.title} ${link.summary} ${link.keywords}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/);
      const score = documentTokens.reduce(
        (total, token) => total + (queryTokens.has(token) ? 1 : 0),
        0,
      );
      return { link, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ link }) => link);
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

async function getInternalLinkContext() {
  const posts = await db.query.blogPosts.findMany({
    where: and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)),
    columns: {
      title: true,
      slug: true,
      summary: true,
      focusKeyword: true,
      metaKeywords: true,
    },
    orderBy: (table, { desc }) => [desc(table.publishedAt)],
    limit: 50,
  });

  return posts.map((post) => ({
    title: post.title,
    url: `/blog/${post.slug}`,
    summary: post.summary,
    keywords: [post.focusKeyword, post.metaKeywords].filter(Boolean).join(", "),
  }));
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

    const body = await request.json() as { topic?: unknown; keyword?: unknown; planId?: unknown };
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const keyword = typeof body.keyword === "string" ? body.keyword.trim().slice(0, 100) : "";
    const planId = typeof body.planId === "string" ? body.planId : null;

    if (topic.length < 5 || topic.length > 200) {
      return NextResponse.json({ error: "Topik harus berisi 5-200 karakter." }, { status: 400 });
    }

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      return NextResponse.json({ error: "Gemini API belum dikonfigurasi." }, { status: 503 });
    }

    const productContext = await getApprovedProductContext();
    const internalLinks: InternalLink[] = await getInternalLinkContext();
    const internalLinkContext = internalLinks.length > 0
      ? internalLinks.map((link) => `- ${link.title}\n  URL: ${link.url}\n  Ringkasan: ${link.summary}\n  Keyword: ${link.keywords || "-"}`).join("\n")
      : "Belum ada artikel published lain yang bisa ditautkan.";
    const prompt = `
Anda adalah editor konten resmi Balikin, platform Smart Lost & Found QR Tag Indonesia.
Buat satu artikel blog berbahasa Indonesia berdasarkan topik berikut.

Topik: ${topic}
Keyword utama: ${keyword || "tentukan keyword yang paling relevan"}

Aturan wajib:
- Hasilkan artikel yang berguna, spesifik, dan mudah dipindai pembaca.
- Gunakan Markdown untuk content dengan heading, paragraf, list, dan contoh yang relevan.
- Pisahkan setiap paragraf dengan satu baris kosong (dua karakter newline / \\n\\n); jangan menggabungkan paragraf menjadi satu blok teks.
- Jangan mengarang harga, fitur, garansi, kebijakan, angka pengguna, atau klaim teknis.
- Jika membahas produk Balikin, gunakan hanya fakta dari knowledge base di bawah.
- Jika topik meminta fakta yang tidak tersedia, tulis artikel edukatif umum dan jangan mengklaim fakta tersebut sebagai fakta Balikin.
- Jangan menyebut bahwa artikel dibuat oleh AI.
- Summary harus 50-500 karakter.
- Content harus minimal 300 kata, bukan sekadar 300 karakter.
- Buat recommended slug yang singkat, deskriptif, dan relevan dengan topik serta keyword utama.
- Focus keyword wajib digunakan persis minimal 2 kali secara natural di dalam content, bukan hanya di judul atau metadata.
- Meta description harus berupa rekomendasi SEO sepanjang 120-160 karakter dan maksimal 300 karakter.
- Meta keywords berupa daftar dipisahkan koma.
- Jika tersedia minimal 2 artikel published di daftar internal link, sisipkan 2-4 internal link yang paling relevan secara alami di dalam content Markdown.
- Gunakan URL internal link persis seperti yang tersedia, jangan mengubah slug atau domainnya.
- Jangan menambahkan link ke artikel yang tidak ada di daftar dan jangan membuat link ke draft.
- Setiap artikel WAJIB mengaitkan solusi produk Balikin secara halus (soft-selling, bukan hard-selling): kaitkan 1 contoh penggunaan yang masuk akal dengan 1-2 produk dari knowledge base.
- Sisipkan 1-2 link produk Markdown yang ditempatkan natural di body artikel (misalnya saat memberi solusi atau contoh), maksimal 3 link produk.
- Hanya gunakan URL produk persis dari daftar ini: /pricing, /stickers, /stickers/checkout, /sign-up, /how-it-works. Jangan membuat URL produk baru.
- Tutup artikel dengan bagian singkat "## Solusi Praktis dengan Balikin" berisi 2-4 kalimat yang mengarahkan ke 1 link produk paling relevan.
- Jangan menyebut harga pasti; gunakan frasa "harga referensi" dan arahkan pembaca ke halaman produk untuk harga terbaru.
- Hindari klaim agresif seperti "terbaik sedunia", "dijamin pasti kembali", atau "tidak akan pernah hilang".

Knowledge base produk:
${productContext}

Daftar artikel published untuk internal link:
${internalLinkContext}
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
              maxOutputTokens: 4500,
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

           if (String(generated.summary).length < 50 || countWords(String(generated.content)) < 300) {
             throw new Error("Gemini returned an article with fewer than 300 words");
           }

           const focusKeyword = String(generated.focusKeyword).trim().replace(/\s+/g, " ");
           const normalizedSlug = ensureSlugContainsKeyword(String(generated.slug), focusKeyword);
           if (!normalizedSlug) throw new Error("Gemini returned an invalid slug");
           if (countKeywordOccurrences(String(generated.content), focusKeyword) < 2) {
             throw new Error("Gemini returned content with fewer than 2 focus keyword occurrences");
           }

           let content = String(generated.content);
           if (internalLinks.length >= 2) {
             const availableUrls = new Set(internalLinks.map((link) => link.url));
             const markdownLinks = [...content.matchAll(/\[([^\]]+)\]\((\/blog\/[a-z0-9-_]+)\)/g)];
             const linkedUrls = [...new Set(markdownLinks.map((match) => match[2]))]
               .filter((url) => availableUrls.has(url));

             // Keep the generated article within the 2-4 link range.
             if (linkedUrls.length > 4) {
               const allowedUrls = new Set(linkedUrls.slice(0, 4));
               content = content.replace(/\[([^\]]+)\]\((\/blog\/[a-z0-9-_]+)\)/g, (match, label, url) => (
                 availableUrls.has(url) && !allowedUrls.has(url) ? label : match
               ));
             }

              if (linkedUrls.length < 2) {
                const fallbackCount = Math.min(3, Math.max(2, 4 - linkedUrls.length));
                const fallbackLinks = rankInternalLinks(internalLinks, topic, keyword)
                  .filter((link) => !linkedUrls.includes(link.url))
                  .slice(0, fallbackCount);
                content += `\n\n## Baca Juga\n\n${fallbackLinks.map((link) => `- [${link.title}](${link.url})`).join("\n")}`;
              }
            }

           // Validasi soft-selling produk: maksimal 3 link produk, minimal 1 link produk.
           const productLinkMatches = [...content.matchAll(/\[([^\]]+)\]\((\/(?:pricing|stickers|sign-up|how-it-works)[a-z0-9\-_/?=&]*?)\)/g)];
           const validProductUrls = [...new Set(productLinkMatches.map((match) => match[2]))]
             .filter((url) => isAllowedProductUrl(url));

           if (validProductUrls.length > 3) {
             const allowedUrls = new Set(validProductUrls.slice(0, 3));
             content = content.replace(/\[([^\]]+)\]\((\/(?:pricing|stickers|sign-up|how-it-works)[a-z0-9\-_/?=&]*?)\)/g, (match, label, url) => (
               isAllowedProductUrl(url) && !allowedUrls.has(url) ? String(label) : match
             ));
           }

           if (validProductUrls.length === 0) {
             const fallbackProductUrl = pickFallbackProductUrl(topic, keyword);
             const fallbackProductLabel = fallbackProductUrl === "/sign-up"
               ? "coba Balikin Free Pass gratis"
               : "lihat pilihan Stiker Balikin";
             if (!content.includes("## Solusi Praktis dengan Balikin")) {
               content += `\n\n## Solusi Praktis dengan Balikin\n\nAgar tips di atas lebih mudah diterapkan, tempelkan QR Balikin pada barang yang paling sering dibawa. Anda bisa mulai dengan [${fallbackProductLabel}](${fallbackProductUrl}) dan cek harga referensi terbaru di halaman produk.`;
             } else {
               content += `\n\nAnda bisa mulai dengan [${fallbackProductLabel}](${fallbackProductUrl}) dan cek harga referensi terbaru di halaman produk.`;
             }
           }

            if (planId) {
              await db.update(blogContentPlans)
                .set({ status: "ai_drafted", updatedAt: new Date() })
                .where(eq(blogContentPlans.id, planId));
            }

            return NextResponse.json({
            title: generated.title,
            summary: generated.summary,
             content,
            slug: normalizedSlug,
            metaDescription: generated.metaDescription,
            metaKeywords: generated.metaKeywords,
             focusKeyword,
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

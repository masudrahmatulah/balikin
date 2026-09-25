import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, asc, eq, isNull } from "drizzle-orm";
import { absoluteUrl } from "@/lib/seo";

export async function GET() {
  const posts = await db.query.blogPosts.findMany({
    where: and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)),
    orderBy: [asc(blogPosts.publishedAt)],
    columns: { title: true, slug: true, summary: true, updatedAt: true },
  });

  const lines = [
    "# Balikin",
    "> Balikin adalah platform smart lost & found berbasis QR code di Indonesia.",
    "",
    "## Informasi Utama",
    `- Beranda: ${absoluteUrl("/")}`,
    `- Cara kerja: ${absoluteUrl("/how-it-works")}`,
    `- Produk: ${absoluteUrl("/stickers")}`,
    `- Harga: ${absoluteUrl("/pricing")}`,
    `- FAQ: ${absoluteUrl("/faq")}`,
    `- Blog: ${absoluteUrl("/blog")}`,
    "",
    "## Artikel",
    ...posts.map(
      (post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.summary}`
    ),
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

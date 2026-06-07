import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages = [
    "/",
    "/about",
    "/how-it-works",
    "/stickers",
    "/pricing",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/upgrade",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  // Dynamic blog posts
  let blogPostsUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.query.blogPosts.findMany({
      where: eq(blogPosts.isPublished, true),
      columns: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      limit: 1000,
    });

    blogPostsUrls = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  return [...staticPages, ...blogPostsUrls];
}

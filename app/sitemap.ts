import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages = [
    "/",
    "/blog",
    "/about",
    "/how-it-works",
    "/stickers",
    "/pricing",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/upgrade",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  // Dynamic blog posts
  let blogPostsUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.query.blogPosts.findMany({
      where: and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)),
      columns: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        coverImage: true,
      },
    });

    blogPostsUrls = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt || post.publishedAt || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  return [...staticPages, ...blogPostsUrls];
}

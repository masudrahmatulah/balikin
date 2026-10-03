import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static page dates reflect the last content changes in the repository.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/how-it-works"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/stickers"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/produk"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/pricing"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/faq"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contact"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/help"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/security"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/privacy-policy"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/terms-of-service"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Dynamic blog posts
  let blogPostsUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.query.blogPosts.findMany({
      where: and(
        eq(blogPosts.app_id, "balikin_id"),
        eq(blogPosts.isPublished, true),
        isNull(blogPosts.deletedAt),
      ),
      columns: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        coverImage: true,
      },
    });

    blogPostsUrls = posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      ...(post.updatedAt || post.publishedAt
        ? { lastModified: post.updatedAt || post.publishedAt }
        : {}),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch blog posts for sitemap:", error);
  }

  return [...staticPages, ...blogPostsUrls];
}

import type { BlogModule, BlogPostingSchema } from "@/types/blog";

interface BlogPostLike {
  title: string;
  slug: string;
  summary: string;
  content?: string | null;
  coverImage?: string | null;
  authorName: string;
  reviewedBy?: string | null;
  reviewedByTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  focusKeyword?: string | null;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function getBlogBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://balikin.online"
  ).replace(/\/+$/, "");
}

function toAbsoluteUrl(url: string | null | undefined, baseUrl: string): string {
  if (!url) return `${baseUrl}/balikin_logo.webp`;
  if (/^https?:\/\//.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function toIsoDate(value: Date | string | null | undefined, fallback: Date | string): string {
  const date = value ? new Date(value) : new Date(fallback);
  if (Number.isNaN(date.getTime())) return new Date(fallback).toISOString();
  return date.toISOString();
}

function countWords(value: string | null | undefined): number {
  if (!value) return 0;
  return value
    .replace(/[`*_#>\[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function splitKeywords(post: BlogPostLike): string[] {
  const keywords = [post.focusKeyword, post.metaKeywords]
    .filter(Boolean)
    .join(",")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return [...new Set(keywords)];
}

export function buildBlogSchemas(
  post: BlogPostLike,
  modules: BlogModule[],
  slug: string,
): Array<Record<string, unknown>> {
  const baseUrl = getBlogBaseUrl();
  const canonicalUrl = `${baseUrl}/blog/${slug}`;
  const description = post.metaDescription || post.summary;
  const keywords = splitKeywords(post);

  const blogSchema: BlogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonicalUrl}#article`,
    headline: post.title,
    description,
    image: toAbsoluteUrl(post.coverImage, baseUrl),
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Balikin",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/balikin_logo.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    datePublished: toIsoDate(post.publishedAt ?? post.createdAt, post.createdAt),
    dateModified: toIsoDate(post.updatedAt, post.createdAt),
    inLanguage: "id-ID",
    wordCount: countWords(post.content),
  };

  if (keywords.length > 0) {
    blogSchema.keywords = keywords;
  }

  if (post.focusKeyword) {
    blogSchema.articleSection = post.focusKeyword;
  }

  if (post.reviewedBy) {
    blogSchema.reviewedBy = {
      "@type": "Person",
      name: post.reviewedBy,
      jobTitle: post.reviewedByTitle || "Expert Reviewer",
    };
  }

  const schemas: Array<Record<string, unknown>> = [
    blogSchema as unknown as Record<string, unknown>,
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Beranda",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${baseUrl}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonicalUrl,
        },
      ],
    },
  ];

  const faqModule = modules.find((module) => module.type === "faq");
  if (faqModule && "data" in faqModule && Array.isArray(faqModule.data)) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqModule.data.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}

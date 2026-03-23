import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
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
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

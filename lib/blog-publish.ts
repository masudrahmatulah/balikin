import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

/**
 * Publish scheduled posts whose scheduledAt time has passed.
 * Called by cron job every 5 minutes.
 */
export async function publishScheduledPosts() {
  const now = new Date();

  // Find posts that are:
  // - Not published (isPublished = false)
  // - Have a scheduledAt time
  // - scheduledAt is in the past
  const scheduledPosts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.isPublished, false),
      lt(blogPosts.scheduledAt, now)
    ),
  });

  if (scheduledPosts.length === 0) {
    return { published: 0, posts: [] };
  }

  // Publish each post
  const publishedPosts = [];
  for (const post of scheduledPosts) {
    if (!post.scheduledAt) continue;

    await db.update(blogPosts)
      .set({
        isPublished: true,
        publishedAt: post.scheduledAt,
      })
      .where(eq(blogPosts.id, post.id));

    publishedPosts.push({
      id: post.id,
      title: post.title,
      slug: post.slug,
      scheduledAt: post.scheduledAt,
    });
  }

  return {
    published: publishedPosts.length,
    posts: publishedPosts,
  };
}

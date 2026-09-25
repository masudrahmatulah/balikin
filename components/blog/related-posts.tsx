import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { getRelatedPosts } from "@/lib/blog-queries";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  coverImageAlt: string | null;
  publishedAt: string;
}

interface RelatedPostsProps {
  postId: string;
  currentSlug: string;
}

export async function BlogRelatedPosts({ postId }: RelatedPostsProps) {
  const posts = await getRelatedPosts(postId);

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 my-8">
      <h3 className="text-lg font-bold mb-4">Artikel Terkait</h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all"
          >
            <div className="flex gap-4">
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {post.summary}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  Baca Selengkapnya
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

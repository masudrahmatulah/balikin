import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getBlogPosts() {
  const posts = await db.query.blogPosts.findMany({
    where: (table) => eq(table.isPublished, true),
    orderBy: [desc(blogPosts.publishedAt)],
    limit: 20,
  });
  return posts;
}

export default async function BlogPage() {
  try {
    const posts = await getBlogPosts();

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog BALIKIN</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">
              Tips, cerita, dan panduan keamanan barang Anda. Belajar dari pengalaman nyata dan ikut kuis berhadiah!
            </p>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="container mx-auto px-4 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada artikel yang diterbitkan.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                >
                  {post.coverImage && (
                    <div className="aspect-video w-full overflow-hidden relative">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                      {post.summary}
                    </p>
                    <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.authorName}</span>
                      </div>
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(post.publishedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading blog page:', error);
    notFound();
  }
}

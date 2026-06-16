import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

async function getBlogPosts() {
  const posts = await db.select().from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(20);
  return posts;
}

export default async function MobileBlogPage() {
  const posts = await getBlogPosts();

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Hero */}
        <div className="bg-gradient-to-br from-mobile-primary to-mobile-primary-dark rounded-3xl p-6 text-center mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Blog Balikin</h1>
          <p className="text-blue-100 text-sm">
            Tips, cerita, dan panduan keamanan barang
          </p>
        </div>

        {/* Blog Posts */}
        {posts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center">
            <p className="text-gray-500">Belum ada artikel yang diterbitkan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/mobile/blog/${post.slug}`}
                className="block"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-white/20 btn-press">
                  {post.coverImage && (
                    <div className="aspect-video w-full relative">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 448px) 100vw"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}

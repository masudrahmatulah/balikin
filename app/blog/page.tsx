import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { isNull, and } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Blog Balikin: Tips Keamanan Barang dan Lost & Found',
  description: 'Baca panduan, tips, dan cerita tentang keamanan barang, QR Smart Tag, serta cara meningkatkan peluang barang hilang kembali.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog Balikin: Tips Keamanan Barang dan Lost & Found',
    description: 'Panduan praktis tentang keamanan barang, QR Smart Tag, dan lost & found di Indonesia.',
    type: 'website',
  },
};

async function getBlogPosts() {
  const posts = await db.query.blogPosts.findMany({
    where: and(eq(blogPosts.isPublished, true), isNull(blogPosts.deletedAt)),
    orderBy: [desc(blogPosts.publishedAt)],
    limit: 20,
  });
  return posts;
}

export default async function BlogPage() {
  try {
    const posts = await getBlogPosts();

    return (
       <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
         <SiteHeader />
         {/* Header */}
         <div className="bg-gradient-to-r from-brand-navy to-brand-red text-white py-16 md:py-24">
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
                   className="group flex flex-col overflow-hidden rounded-2xl border border-red-100 bg-card transition-all hover:border-brand-red/40 hover:shadow-lg hover:shadow-red-900/10 dark:border-slate-700"
                >
                  {post.coverImage && (
                    <div className="aspect-video w-full overflow-hidden relative">
                      <Image
                        src={post.coverImage}
                         alt={post.coverImageAlt || post.focusKeyword || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                     <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-brand-red transition-colors">
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

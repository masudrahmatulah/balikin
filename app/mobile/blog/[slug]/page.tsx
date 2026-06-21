import { notFound } from 'next/navigation';
import { db } from '@/db';
import { blogPosts, blogComments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Calendar, ArrowLeft, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });

  if (!post) return null;

  const comments = await db.query.blogComments.findMany({
    where: eq(blogComments.postId, post.id),
  });

  return { post, comments };
}

const formatDate = (date: Date | null) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default async function MobileBlogDetailPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const data = await getBlogPost(slug);

  if (!data || !data.post) {
    notFound();
  }

  const { post, comments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile/blog">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video w-full relative rounded-2xl overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 448px) 100vw"
            />
          </div>
        )}

        {/* Article Header */}
        <article className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            {post.authorName && (
              <>
                <span>•</span>
                <span>{post.authorName}</span>
              </>
            )}
          </div>

          {post.summary && (
            <div className="bg-mobile-info-lighter text-mobile-info rounded-xl p-4 mb-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Ringkasan
              </p>
              <p className="text-sm mt-2">{post.summary}</p>
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-gray-900 mt-6 mb-3" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-gray-900 mt-5 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-bold text-gray-900 mt-4 mb-2" {...props} />,
                  p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-3" {...props} />,
                  a: ({ node, ...props }) => (
                    <a className="text-mobile-primary hover:underline" {...props} />
                  ),
                  ul: ({ node, ...props }) => <ul className="space-y-2 mb-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="space-y-2 mb-4" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-mobile-primary pl-4 py-2 my-4 bg-mobile-primary-lighter italic" {...props} />
                  ),
                  code: ({ node, ...props }) => (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs" {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-4" {...props} />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          )}
        </article>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Komentar ({comments.length})
            </h2>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className="text-xs text-gray-500">
                      {comment.createdAt ? formatDate(comment.createdAt) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Lindungi Barang Anda</h2>
          <p className="text-sm text-gray-600 mb-4">
            Mulai gunakan Balikin untuk melindungi barang berharga Anda.
          </p>
          <Link href="/mobile/new" className="block">
            <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press">
              Buat Tag Gratis
            </div>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

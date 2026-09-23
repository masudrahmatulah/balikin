import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { and, eq } from 'drizzle-orm';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/blog');

  const { id } = await params;
  const post = await db.query.blogPosts.findFirst({
    where: and(eq(blogPosts.id, id), eq(blogPosts.app_id, 'balikin_id')),
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Link href="/admin/blog"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Blog</Button></Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">Preview Admin · perubahan belum tentu tersimpan</span>
            <Link href={`/admin/blog/${post.id}/edit`}><Button size="sm"><Pencil className="mr-2 h-4 w-4" />Edit</Button></Link>
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-10 border-b pb-8">
          <span className="text-sm font-medium text-brand-red">{post.isPublished ? 'Published' : 'Draft Preview'}</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.summary}</p>
          <p className="mt-5 text-sm text-muted-foreground">{post.authorName}</p>
        </header>
        <article className="blog-markdown prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}

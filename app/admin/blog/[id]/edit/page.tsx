import { notFound, redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { blogContentPlans, blogPosts, user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { BlogEditorForm } from '@/components/blog/blog-editor-form';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/blog');

  const { id } = await params;
  const [post, editors] = await Promise.all([
    db.query.blogPosts.findFirst({
      where: and(eq(blogPosts.id, id), eq(blogPosts.app_id, 'balikin_id')),
    }),
    db.query.user.findMany({
      where: eq(user.role, 'admin'),
      columns: { id: true, name: true, email: true },
    }),
  ]);

  if (!post) notFound();

  const contentPlan = await db.query.blogContentPlans.findFirst({
    where: and(eq(blogContentPlans.linkedPostId, post.id), eq(blogContentPlans.app_id, 'balikin_id')),
    columns: { id: true, targetMinWords: true, targetMaxWords: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground">Perbarui artikel, SEO, dan status publikasi.</p>
      </div>
      <BlogEditorForm
        editors={editors}
        currentUserId={session.user.id}
        postId={post.id}
        contentPlanId={contentPlan?.id}
        targetMinWords={contentPlan?.targetMinWords}
        targetMaxWords={contentPlan?.targetMaxWords}
        initialPost={{
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage || '',
          coverImageAlt: post.coverImageAlt || '',
          authorName: post.authorName,
          authorId: post.authorId || session.user.id,
          authorAvatar: post.authorAvatar || '',
          reviewedBy: post.reviewedBy || '',
          reviewedById: post.reviewedById || '',
          reviewedByTitle: post.reviewedByTitle || '',
          metaDescription: post.metaDescription || '',
          metaKeywords: post.metaKeywords || '',
          focusKeyword: post.focusKeyword || '',
          scheduledAt: post.scheduledAt ? post.scheduledAt.toISOString().slice(0, 16) : '',
          modules: post.modules || [],
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { blogContentPlans, user } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { BlogEditorForm } from '@/components/blog/blog-editor-form';

async function getEditors() {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }

  const editors = await db.query.user.findMany({
    where: eq(user.role, 'admin'),
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  return { editors, session };
}

export default async function NewBlogPostPage({ searchParams }: { searchParams: Promise<{ planId?: string }> }) {
  const data = await getEditors();

  if (!data) {
    redirect('/');
  }

  const { editors, session } = data;
  const { planId } = await searchParams;
  const plan = planId
    ? await db.query.blogContentPlans.findFirst({ where: and(eq(blogContentPlans.id, planId), eq(blogContentPlans.app_id, 'balikin_id')) })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground">Write and publish your article with interactive modules</p>
      </div>

      <BlogEditorForm
        editors={editors}
        currentUserId={session.user.id}
        contentPlanId={plan?.id}
        initialGenerationTopic={plan?.title || ''}
        initialGenerationKeyword={plan?.focusKeyword || ''}
        targetMinWords={plan?.targetMinWords}
        targetMaxWords={plan?.targetMaxWords}
      />
    </div>
  );
}

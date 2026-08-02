import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { BlogEditorForm } from '@/components/blog/blog-editor-form';

async function getEditors() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
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

export default async function NewBlogPostPage() {
  const data = await getEditors();

  if (!data) {
    redirect('/');
  }

  const { editors, session } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        <p className="text-muted-foreground">Write and publish your article with interactive modules</p>
      </div>

      <BlogEditorForm editors={editors} currentUserId={session.user.id} />
    </div>
  );
}

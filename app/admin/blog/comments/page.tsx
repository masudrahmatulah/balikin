import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { blogComments, blogPosts, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { CommentsTable } from '@/components/blog/comments-table';

async function getComments() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const comments = await db.query.blogComments.findMany({
    orderBy: [desc(blogComments.createdAt)],
    with: {
      post: true,
      author: true,
    },
  });

  return { comments, currentUserId: session.user.id };
}

export default async function AdminCommentsPage() {
  const data = await getComments();

  if (!data) {
    redirect('/');
  }

  const { comments, currentUserId } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comments Moderation</h1>
        <p className="text-muted-foreground">Review and manage blog comments</p>
      </div>

      <CommentsTable comments={comments} currentUserId={currentUserId} />
    </div>
  );
}

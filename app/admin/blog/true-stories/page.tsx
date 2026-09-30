import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { trueStorySubmissions } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { TrueStoriesTable } from '@/components/blog/true-stories-table';

async function getTrueStorySubmissions() {
  const session = await getAdminSession();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const submissions = await db.query.trueStorySubmissions.findMany({
    orderBy: [desc(trueStorySubmissions.createdAt)],
  });

  return {
    submissions: submissions.map((submission) => ({
      ...submission,
      storyDescription: submission.storyText,
    })),
    currentUserId: session.user.id,
  };
}

export default async function AdminTrueStoriesPage() {
  const data = await getTrueStorySubmissions();

  if (!data) {
    redirect('/');
  }

  const { submissions, currentUserId } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">True Story Submissions</h1>
        <p className="text-muted-foreground">Review video testimonials for jacket giveaway</p>
      </div>

      <TrueStoriesTable submissions={submissions} currentUserId={currentUserId} />
    </div>
  );
}

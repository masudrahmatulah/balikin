import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { BulkScheduleDrafts } from '@/components/blog/bulk-schedule-drafts';

export default async function DraftsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/');
  }

  const drafts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.app_id, 'balikin_id'),
      eq(blogPosts.isPublished, false),
      isNull(blogPosts.scheduledAt),
      isNull(blogPosts.deletedAt),
    ),
    orderBy: [desc(blogPosts.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Draft Posts</h1>
          <p className="text-muted-foreground">Manage unpublished articles</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          New Post
        </Link>
      </div>

      <BulkScheduleDrafts drafts={drafts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        createdAt: post.createdAt.toISOString(),
      }))} />
    </div>
  );
}

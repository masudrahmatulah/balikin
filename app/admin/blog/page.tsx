import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { desc, eq, and, isNull } from 'drizzle-orm';
import Link from 'next/link';
import { Plus, MessageSquare, Gift, Video, Eye } from 'lucide-react';
import { BlogPostsManager } from '@/components/blog/blog-posts-manager';

async function getAdminData() {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }

  // Simplified queries to avoid relational issues
  const posts = await db.select().from(blogPosts)
    .where(and(eq(blogPosts.app_id, 'balikin_id'), isNull(blogPosts.deletedAt)))
    .orderBy(desc(blogPosts.createdAt));

  return {
    posts,
    pendingClaims: [],
    pendingComments: [],
    pendingStories: [],
    stats: {
      totalPosts: posts.length,
      pendingClaims: 0,
      pendingStories: 0,
    },
  };
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const initialStatus = ['draft', 'scheduled', 'published'].includes(params.status || '')
    ? params.status as 'draft' | 'scheduled' | 'published'
    : 'all';
  const data = await getAdminData();

  if (!data) {
    redirect('/');
  }

  const { posts, pendingClaims, pendingComments, pendingStories, stats } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Kelola artikel, kuis, dan giveaway</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Claims</p>
              <p className="text-2xl font-bold">{stats.pendingClaims}</p>
            </div>
            <Gift className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Stories</p>
              <p className="text-2xl font-bold">{stats.pendingStories}</p>
            </div>
            <Video className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>
      </div>

      <BlogPostsManager
        initialStatus={initialStatus}
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          createdAt: post.createdAt.toISOString(),
          publishedAt: post.publishedAt?.toISOString() || null,
          scheduledAt: post.scheduledAt?.toISOString() || null,
          isPublished: post.isPublished,
        }))}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/blog/giveaway"
          className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all"
        >
          <Gift className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-bold">Giveaway Claims</h3>
          <p className="text-sm text-muted-foreground">{pendingClaims.length} pending</p>
        </Link>

        <Link
          href="/admin/blog/comments"
          className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all"
        >
          <MessageSquare className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-bold">Comments</h3>
          <p className="text-sm text-muted-foreground">{pendingComments.length} total</p>
        </Link>

        <Link
          href="/admin/blog/true-stories"
          className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all"
        >
          <Video className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-bold">True Stories</h3>
          <p className="text-sm text-muted-foreground">{pendingStories.length} pending</p>
        </Link>

        <Link
          href="/admin/blog/analytics"
          className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all"
        >
          <Eye className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-bold">Analytics</h3>
          <p className="text-sm text-muted-foreground">View metrics</p>
        </Link>
      </div>
    </div>
  );
}

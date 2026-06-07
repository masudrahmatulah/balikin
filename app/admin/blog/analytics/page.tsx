import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { blogPosts, blogPostsAnalytics, blogComments } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MessageSquare, Users, TrendingUp } from 'lucide-react';

async function getAnalyticsData() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  // Get all published posts with analytics
  const posts = await db.query.blogPosts.findMany({
    where: eq(blogPosts.isPublished, true),
    orderBy: [desc(blogPosts.publishedAt)],
    limit: 20,
  });

  // Get analytics for each post
  const postAnalytics = await Promise.all(
    posts.map(async (post) => {
      const analytics = await db.query.blogPostsAnalytics.findMany({
        where: eq(blogPostsAnalytics.postId, post.id),
      });

      const comments = await db.query.blogComments.findMany({
        where: eq(blogComments.postId, post.id),
      });

      const pageViews = analytics.filter(a => a.viewType === 'page_view').length;
      const engagements = analytics.filter(a => a.viewType === 'engagement').length;
      const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;

      return {
        ...post,
        pageViews,
        engagements,
        uniqueVisitors,
        commentsCount: comments.length,
      };
    })
  );

  // Calculate totals
  const totals = postAnalytics.reduce(
    (acc, post) => ({
      pageViews: acc.pageViews + post.pageViews,
      engagements: acc.engagements + post.engagements,
      comments: acc.comments + post.commentsCount,
    }),
    { pageViews: 0, engagements: 0, comments: 0 }
  );

  return {
    posts: postAnalytics,
    totals,
    stats: {
      totalPosts: posts.length,
      totalPageViews: totals.pageViews,
      totalEngagements: totals.engagements,
      totalComments: totals.comments,
    },
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  if (!data) {
    redirect('/');
  }

  const { posts, stats } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog Analytics</h1>
        <p className="text-muted-foreground">Track page views and engagement metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{stats.totalPageViews}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold">{stats.totalEngagements}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalComments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.totalPosts}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Post Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Post</th>
                  <th className="text-right py-3 px-2">Views</th>
                  <th className="text-right py-3 px-2">Engagements</th>
                  <th className="text-right py-3 px-2">Comments</th>
                  <th className="text-right py-3 px-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const engagementRate = post.pageViews > 0
                    ? ((post.engagements / post.pageViews) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={post.id} className="border-b hover:bg-accent/50">
                      <td className="py-3 px-2">
                        <div className="max-w-md">
                          <p className="font-medium text-sm truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-sm">{post.pageViews}</td>
                      <td className="text-right py-3 px-2 text-sm">{post.engagements}</td>
                      <td className="text-right py-3 px-2 text-sm">{post.commentsCount}</td>
                      <td className="text-right py-3 px-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          parseFloat(engagementRate) > 5 ? 'bg-emerald-100 text-emerald-700' :
                          parseFloat(engagementRate) > 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {engagementRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Edit, Eye, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

async function getDrafts() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/drafts`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.drafts || [];
}

export default async function DraftsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const drafts = await getDrafts();

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

      <div className="bg-card rounded-xl border">
        {drafts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No drafts found. Create your first draft!
          </div>
        ) : (
          <div className="divide-y">
            {drafts.map((post: any) => (
              <div key={post.id} className="p-4 flex items-center justify-between hover:bg-accent/50">
                <div className="flex-1">
                  <h3 className="font-medium">{post.title || 'Untitled'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.slug || 'No slug'} • Created {new Date(post.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="p-2 hover:bg-accent rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 hover:bg-accent rounded-lg"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

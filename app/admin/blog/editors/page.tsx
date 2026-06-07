import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { getBlogEditors, updateUserBlogPermissions } from '@/lib/blog-permissions';
import Link from 'next/link';
import { Plus, Edit, Trash2, Shield, UserPlus } from 'lucide-react';

async function getEditorsData() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const editors = await getBlogEditors();

  return editors.map(editor => ({
    id: editor.id,
    name: editor.name || 'Unknown',
    email: editor.email,
    role: editor.role,
    permissions: editor.blogPermissions || {},
  }));
}

async function updateEditorPermissions(formData: FormData) {
  'use server';

  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return;
  }

  const userId = formData.get('userId') as string;
  const canCreatePosts = formData.get('canCreatePosts') === 'true';
  const canEditOwnPosts = formData.get('canEditOwnPosts') === 'true';
  const canEditAnyPost = formData.get('canEditAnyPost') === 'true';
  const canPublishPosts = formData.get('canPublishPosts') === 'true';
  const canModerateComments = formData.get('canModerateComments') === 'true';
  const canManageGiveaway = formData.get('canManageGiveaway') === 'true';
  const canReviewStories = formData.get('canReviewStories') === 'true';

  await updateUserBlogPermissions(userId, {
    canCreatePosts,
    canEditOwnPosts,
    canEditAnyPost,
    canPublishPosts,
    canModerateComments,
    canManageGiveaway,
    canReviewStories,
  });

  redirect('/admin/blog/editors');
}

export default async function AdminBlogEditorsPage() {
  const editors = await getEditorsData();

  if (!editors) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Blog Editors & Permissions</h1>
          <p className="text-muted-foreground">Manage blog editors and their permissions</p>
        </div>
        <Link
          href="/admin/blog/editors/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Editor</span>
        </Link>
      </div>

      {/* Editors List */}
      <div className="bg-card rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Current Editors ({editors.length})</h2>
        </div>
        <div className="divide-y">
          {editors.map((editor) => (
            <div key={editor.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{editor.name}</h3>
                  <p className="text-sm text-muted-foreground">{editor.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                    {editor.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/blog/editors/${editor.id}/edit`}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PermissionBadge
                  label="Create Posts"
                  granted={editor.permissions.canCreatePosts}
                />
                <PermissionBadge
                  label="Edit Own Posts"
                  granted={editor.permissions.canEditOwnPosts}
                />
                <PermissionBadge
                  label="Edit Any Post"
                  granted={editor.permissions.canEditAnyPost}
                />
                <PermissionBadge
                  label="Publish Posts"
                  granted={editor.permissions.canPublishPosts}
                />
                <PermissionBadge
                  label="Moderate Comments"
                  granted={editor.permissions.canModerateComments}
                />
                <PermissionBadge
                  label="Manage Giveaway"
                  granted={editor.permissions.canManageGiveaway}
                />
                <PermissionBadge
                  label="Review Stories"
                  granted={editor.permissions.canReviewStories}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold mb-4">Permission Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Create Posts:</strong> Can create new blog posts
          </div>
          <div>
            <strong>Edit Own Posts:</strong> Can only edit posts they created
          </div>
          <div>
            <strong>Edit Any Post:</strong> Can edit any post regardless of author
          </div>
          <div>
            <strong>Publish Posts:</strong> Can change draft posts to published
          </div>
          <div>
            <strong>Moderate Comments:</strong> Can approve/reject comments
          </div>
          <div>
            <strong>Manage Giveaway:</strong> Can approve giveaway claims
          </div>
          <div>
            <strong>Review Stories:</strong> Can review true story submissions
          </div>
        </div>
      </div>
    </div>
  );
}

function PermissionBadge({ label, granted }: { label: string; granted: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      granted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20'
    }`}>
      <Shield className={`w-4 h-4 ${granted ? 'text-emerald-600' : 'text-gray-400'}`} />
      <span className={granted ? 'text-emerald-700' : 'text-gray-500'}>{label}</span>
    </div>
  );
}

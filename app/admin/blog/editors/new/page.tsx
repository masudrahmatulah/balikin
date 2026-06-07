import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { updateUserBlogPermissions } from '@/lib/blog-permissions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SubmitButton } from '@/components/submit-button';

async function getUsers() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return [];
  }

  return db.query.user.findMany({
    where: (table, { or, eq, and }) => or(
      eq(table.role, 'user'),
      eq(table.role, 'editor')
    ),
  });
}

async function createEditor(formData: FormData) {
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

  // Update user role to editor and set permissions
  await db.update(user)
    .set({ role: 'editor' })
    .where(eq(user.id, userId));

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

export default async function NewEditorPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog/editors"
          className="p-2 hover:bg-accent rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Editor</h1>
          <p className="text-muted-foreground">Promote a user to editor role</p>
        </div>
      </div>

      {/* Form */}
      <form action={createEditor} className="bg-card rounded-xl border p-6 space-y-6">
        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select User</label>
          <select
            name="userId"
            required
            className="w-full px-3 py-2 border rounded-lg bg-background"
          >
            <option value="">Choose a user...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Permissions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PermissionCheckbox
              name="canCreatePosts"
              label="Create Posts"
              description="Can create new blog posts"
            />
            <PermissionCheckbox
              name="canEditOwnPosts"
              label="Edit Own Posts"
              description="Can only edit posts they created"
            />
            <PermissionCheckbox
              name="canEditAnyPost"
              label="Edit Any Post"
              description="Can edit any post regardless of author"
            />
            <PermissionCheckbox
              name="canPublishPosts"
              label="Publish Posts"
              description="Can change draft posts to published"
            />
            <PermissionCheckbox
              name="canModerateComments"
              label="Moderate Comments"
              description="Can approve/reject comments"
            />
            <PermissionCheckbox
              name="canManageGiveaway"
              label="Manage Giveaway"
              description="Can approve giveaway claims"
            />
            <PermissionCheckbox
              name="canReviewStories"
              label="Review Stories"
              description="Can review true story submissions"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/blog/editors"
            className="px-4 py-2 border rounded-lg hover:bg-accent"
          >
            Cancel
          </Link>
          <SubmitButton>Create Editor</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function PermissionCheckbox({
  name,
  label,
  description,
}: {
  name: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      <input
        type="checkbox"
        name={name}
        value="true"
        id={name}
        className="mt-1"
      />
      <div>
        <label htmlFor={name} className="font-medium cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

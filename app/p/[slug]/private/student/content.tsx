import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { StudentKitModule } from './module';
import type { Tag } from '@/db/schema';

interface StudentKitModuleContentProps {
  tag: Tag;
}

export async function StudentKitModuleContent({
  tag,
}: StudentKitModuleContentProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only render if user is authenticated and owns the tag
  if (!session?.user || tag.ownerId !== session.user.id) {
    return null;
  }

  return <StudentKitModule tag={tag} />;
}

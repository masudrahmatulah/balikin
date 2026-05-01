import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { tags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { StudentKitOnboarding } from '@/components/student/student-kit-onboarding';

interface OnboardingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect(`/sign-in?redirect=${encodeURIComponent(`/p/${slug}/private/student/onboarding`)}`);
  }

  // Get tag
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (!tag) {
    redirect('/dashboard');
  }

  // Check ownership
  if (tag.ownerId !== session.user.id) {
    redirect(`/p/${slug}`);
  }

  // Check if onboarding already completed
  if (tag.onboardingCompleted) {
    redirect(`/p/${slug}/private/student`);
  }

  return <StudentKitOnboarding tagSlug={slug} />;
}

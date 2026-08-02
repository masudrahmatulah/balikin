import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/db';
import { setupGallerySubmissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getPendingSubmissions() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const submissions = await db.query.setupGallerySubmissions.findMany({
    where: eq(setupGallerySubmissions.isApproved, false),
    orderBy: [setupGallerySubmissions.createdAt],
    with: {
      post: true,
    },
  });

  return submissions;
}

async function approveSubmission(submissionId: string) {
  await db.update(setupGallerySubmissions)
    .set({ isApproved: true })
    .where(eq(setupGallerySubmissions.id, submissionId));
}

async function rejectSubmission(submissionId: string) {
  await db.delete(setupGallerySubmissions)
    .where(eq(setupGallerySubmissions.id, submissionId));
}

export default async function SetupGalleryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/');
  }

  const submissions = await getPendingSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Setup Gallery</h1>
        <p className="text-muted-foreground">Review and approve user-submitted setup photos</p>
      </div>

      <Card>
        {submissions?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No pending submissions
          </div>
        ) : (
          <div className="divide-y">
            {submissions?.map((submission: any) => (
              <div key={submission.id} className="p-6">
                <div className="flex gap-6">
                  <img
                    src={submission.photoUrl}
                    alt={`Setup by ${submission.userName}`}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{submission.userName}</h3>
                        <p className="text-sm text-muted-foreground">{submission.userEmail || 'No email'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(submission.createdAt).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-xs font-mono text-emerald-600 mt-1">
                          {submission.discountCode}
                        </p>
                      </div>
                    </div>

                    {submission.description && (
                      <p className="text-sm text-muted-foreground">{submission.description}</p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      From: <Link href={`/blog/${submission.post?.slug}`} className="text-primary hover:underline">
                        {submission.post?.title || 'Unknown Post'}
                      </Link>
                    </p>

                    <div className="flex gap-2 pt-2">
                      <form action={async () => {
                        'use server';
                        await approveSubmission(submission.id);
                      }}>
                        <Button size="sm" variant="default">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </form>
                      <form action={async () => {
                        'use server';
                        await rejectSubmission(submission.id);
                      }}>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </form>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(submission.photoUrl, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Full
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

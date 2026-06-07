import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { giveawayClaims, blogPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { GiveawayClaimsTable } from '@/components/blog/giveaway-claims-table';

async function getGiveawayClaims() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return null;
  }

  const claims = await db.query.giveawayClaims.findMany({
    orderBy: [desc(giveawayClaims.createdAt)],
    with: {
      post: true,
      processor: true,
    },
  });

  return { claims, currentUserId: session.user.id };
}

export default async function AdminGiveawayPage() {
  const data = await getGiveawayClaims();

  if (!data) {
    redirect('/');
  }

  const { claims, currentUserId } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Giveaway Claims</h1>
        <p className="text-muted-foreground">Manage quiz giveaway claims and shipping</p>
      </div>

      <GiveawayClaimsTable claims={claims} currentUserId={currentUserId} />
    </div>
  );
}

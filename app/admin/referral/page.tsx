import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { db } from '@/db';
import { referralVouchers, user } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ReferralAdminClient } from './referral-admin-client';

export default async function AdminReferralPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/referral');

  const pendingClaims = await db
    .select({
      id: referralVouchers.id,
      code: referralVouchers.code,
      usageCount: referralVouchers.usageCount,
      maxUsageTarget: referralVouchers.maxUsageTarget,
      claimStatus: referralVouchers.claimStatus,
      walletProvider: referralVouchers.walletProvider,
      walletNumber: referralVouchers.walletNumber,
      claimedAt: referralVouchers.claimedAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(referralVouchers)
    .leftJoin(user, eq(referralVouchers.userId, user.id))
    .where(
      and(
        eq(referralVouchers.claimStatus, 'PENDING_PROCESSING'),
        eq(referralVouchers.app_id, 'balikin_id')
      )
    )
    .orderBy(referralVouchers.claimedAt);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Antrean Klaim Referral</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pendingClaims.length} klaim menunggu konfirmasi transfer
        </p>
      </div>
      <ReferralAdminClient claims={pendingClaims} />
    </div>
  );
}

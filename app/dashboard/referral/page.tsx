import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getMyReferralVoucher } from '@/app/actions/referral';
import { ReferralClient } from './referral-client';

export default async function ReferralPage() {
  const session = await getSession();
  if (!session?.user) redirect('/sign-in');

  const voucher = await getMyReferralVoucher();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Program Referral</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ajak 10 teman beli Balikin, dapatkan Rp50.000
          </p>
        </div>

        <ReferralClient voucher={voucher} userName={session.user.name ?? 'User'} />
      </div>
    </div>
  );
}

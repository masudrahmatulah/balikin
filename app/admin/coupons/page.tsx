import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { getCoupons } from '@/app/actions/admin-coupon-actions';
import { CouponGenerator } from '@/components/admin/coupon-generator';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/coupons');
  if (session.user.role !== 'admin') redirect('/admin');
  const coupons = await getCoupons();

  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Coupon Generator</h1><p className="text-muted-foreground">Buat dan kelola kode diskon untuk pelanggan.</p></div><CouponGenerator initialCoupons={coupons} /></div>;
}

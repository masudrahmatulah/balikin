import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { canUseAcrylicSupport } from '@/lib/acrylic-support-policy';
import { AcrylicSupportClient } from './support-client';

export const dynamic = 'force-dynamic';

export default async function ActivationSupportPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/activation-support');
  if (!canUseAcrylicSupport(session.user.division)) redirect('/admin');
  return <AcrylicSupportClient />;
}

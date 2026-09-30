import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { VideoPlanner } from '@/components/admin/video-planner';

export const dynamic = 'force-dynamic';

export default async function VideoPlannerPage() {
  const session = await getAdminSession();
  if (!session) redirect('/sign-in?redirect=/admin/marketing/video-planner');
  return <VideoPlanner />;
}

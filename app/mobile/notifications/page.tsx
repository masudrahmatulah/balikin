'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileNotifications } from '@/components/mobile/mobile-notifications';

export default function MobileNotificationsPage() {
  return (
    <MobileLayout activeTab="notifications">
      <MobileNotifications />
    </MobileLayout>
  );
}

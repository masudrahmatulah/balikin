'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileProfile } from '@/components/mobile/mobile-profile';

export default function MobileProfilePage() {
  return (
    <MobileLayout activeTab="profile">
      <MobileProfile />
    </MobileLayout>
  );
}

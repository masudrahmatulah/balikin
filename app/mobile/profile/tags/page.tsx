'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileProfileTags } from '@/components/mobile/mobile-profile-tags';

export default function MobileProfileTagsPage() {
  return (
    <MobileLayout activeTab="profile">
      <MobileProfileTags />
    </MobileLayout>
  );
}

'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileHome } from '@/components/mobile/mobile-home';

export default function MobilePage() {
  return (
    <MobileLayout activeTab="home">
      <MobileHome />
    </MobileLayout>
  );
}

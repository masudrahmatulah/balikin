'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileLostMode } from '@/components/mobile/mobile-lost-mode';

export default function MobileLostModePage() {
  return (
    <MobileLayout activeTab="lost-mode">
      <MobileLostMode />
    </MobileLayout>
  );
}

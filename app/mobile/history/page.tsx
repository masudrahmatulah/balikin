'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileHistory } from '@/components/mobile/mobile-history';

export default function MobileHistoryPage() {
  return (
    <MobileLayout activeTab="history">
      <MobileHistory />
    </MobileLayout>
  );
}

'use client';

import { MobileLayout } from '@/components/mobile/mobile-layout';
import { MobileReport } from '@/components/mobile/mobile-report';

export default function MobileReportPage() {
  return (
    <MobileLayout activeTab="report">
      <MobileReport />
    </MobileLayout>
  );
}

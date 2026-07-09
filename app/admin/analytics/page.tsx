import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin';
import { MarketingDashboard } from '@/components/admin/marketing-dashboard';
import { LostFoundSuccessRate, LostFoundSuccessRateSkeleton } from '@/components/admin/analytics/lost-found-success-rate';
import { GeoScanHeatmap, GeoScanHeatmapSkeleton } from '@/components/admin/analytics/geo-scan-heatmap';
import { BatchActivationMetrics, BatchActivationMetricsSkeleton } from '@/components/admin/analytics/batch-activation-metrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Repeat, RotateCcw, Globe, Boxes, type LucideIcon } from 'lucide-react';

const SECTIONS: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
  heading: string;
  description: string;
}> = [
  {
    value: 'conversion',
    label: 'Conversion Funnel',
    icon: Repeat,
    heading: 'Conversion Funnel Chart',
    description: 'Free Users → Vinyl Sticker → Premium Acrylic / Bundling upgrade path',
  },
  {
    value: 'recovery',
    label: 'Lost & Found Rate',
    icon: RotateCcw,
    heading: 'Lost & Found Success Rate',
    description: 'Recovery ratio and average time-to-scan — the core proof-of-concept metric',
  },
  {
    value: 'geospatial',
    label: 'Geospatial Heatmap',
    icon: Globe,
    heading: 'Geospatial Scan Heatmap',
    description: 'Where scans concentrate, to guide hyperlocal marketing spend',
  },
  {
    value: 'bundles',
    label: 'Batch Activation',
    icon: Boxes,
    heading: 'Batch Activation Metrics',
    description: 'Claim rate per institution for Student Kits, Corporate Packs, and Pet Kits',
  },
];

function SectionHeader({ icon: Icon, heading, description }: { icon: LucideIcon; heading: string; description: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0">
        <Icon size={18} strokeWidth={2} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-display font-semibold text-primary">{heading}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/analytics');
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-display font-bold text-primary">Strategic Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          High-signal visualizations for growth and business decisions
        </p>
      </header>

      <Tabs defaultValue="conversion" className="space-y-6">
        <TabsList
          className="flex w-full flex-nowrap items-center gap-1 overflow-x-auto h-auto bg-neutral rounded-xl p-1.5"
          role="tablist"
          aria-label="Analytics tabs"
        >
          {SECTIONS.map((section) => (
            <TabsTrigger
              key={section.value}
              value={section.value}
              className="flex flex-1 items-center justify-center gap-2 py-2 whitespace-nowrap text-gray-600 font-medium rounded-lg data-active:bg-primary data-active:text-white"
            >
              <section.icon size={16} strokeWidth={2} aria-hidden="true" />
              <span>{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="conversion" role="tabpanel">
          <SectionHeader {...SECTIONS[0]} />
          <MarketingDashboard />
        </TabsContent>

        <TabsContent value="recovery" role="tabpanel">
          <SectionHeader {...SECTIONS[1]} />
          <LostFoundSuccessRate />
        </TabsContent>

        <TabsContent value="geospatial" role="tabpanel">
          <SectionHeader {...SECTIONS[2]} />
          <GeoScanHeatmap />
        </TabsContent>

        <TabsContent value="bundles" role="tabpanel">
          <SectionHeader {...SECTIONS[3]} />
          <BatchActivationMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AdminAnalyticsPageLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
      </header>

      <div className="h-11 w-full bg-neutral rounded-xl animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LostFoundSuccessRateSkeleton />
        <GeoScanHeatmapSkeleton />
        <BatchActivationMetricsSkeleton />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Riwayat Aktivitas',
  description: 'Lihat riwayat aktivitas tag Balikin Anda.',
  path: '/history',
  noIndex: true,
});

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

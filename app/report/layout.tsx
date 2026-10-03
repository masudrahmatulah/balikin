import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Laporkan Barang Ditemukan',
  description: 'Laporkan barang Balikin yang Anda temukan.',
  path: '/report',
  noIndex: true,
});

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}

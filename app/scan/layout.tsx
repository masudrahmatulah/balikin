import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Scan QR',
  description: 'Scan QR code Balikin untuk menemukan atau mengelola tag.',
  path: '/scan',
  noIndex: true,
});

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children;
}

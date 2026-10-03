import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Chat',
  description: 'Percakapan aman terkait tag Balikin.',
  path: '/chat',
  noIndex: true,
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}

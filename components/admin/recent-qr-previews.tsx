'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateQRCodeDataURL } from '@/lib/qrcode-generator';
import { QrCode } from 'lucide-react';

interface RecentTag {
  id: string;
  slug: string;
  name: string;
  tier: string;
  createdAt: string;
}

interface RecentQRPreviewsProps {
  recentTags: RecentTag[];
}

export function RecentQRPreviews({ recentTags }: RecentQRPreviewsProps) {
  const router = useRouter();
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate QR codes for each recent tag
    const generateCodes = async () => {
      const baseUrl = window.location.origin;
      const codes: Record<string, string> = {};

      await Promise.all(
        recentTags.map(async (tag) => {
          try {
            const url = `${baseUrl}/p/${tag.slug}`;
            const dataUrl = await generateQRCodeDataURL(url, {
              size: 200,
              margin: 1,
              color: { dark: '#1f2937', light: '#ffffff' },
            });
            codes[tag.id] = dataUrl;
          } catch (error) {
            console.error(`Failed to generate QR code for ${tag.slug}:`, error);
          }
        })
      );

      setQrCodes(codes);
    };

    generateCodes();
  }, [recentTags]);

  const handleViewAll = () => {
    router.push('/admin/vdp-tool');
  };

  if (recentTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <QrCode className="w-10 h-10 mb-2 text-gray-400" strokeWidth={1.5} />
        <p className="text-sm">Belum ada QR code yang di-generate</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {recentTags.map((tag) => {
          const qrDataUrl = qrCodes[tag.id];
          return (
            <div
              key={tag.id}
              onClick={() => router.push(`/p/${tag.slug}`)}
              className="aspect-square bg-white rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${tag.slug}`}
                  className="w-24 h-24"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 animate-pulse rounded" />
              )}
              <span className="text-xs text-gray-600 font-mono mt-2">#{tag.slug}</span>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleViewAll}
        className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
      >
        View All Previews
      </button>
    </>
  );
}
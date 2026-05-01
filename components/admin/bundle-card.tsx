'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BundleConfig, getBundleConfig, formatBundlePrice } from '@/lib/bundles';
import { getQRBrandConfig } from '@/lib/qr-branding';
import { Download, QrCode, Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tag } from '@/db/schema';
import { cn } from '@/lib/utils';

interface BundleCardProps {
  tag: Tag;
}

export function BundleCard({ tag }: BundleCardProps) {
  const router = useRouter();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const bundleConfig = getBundleConfig(tag.bundleType);
  if (!bundleConfig) return null;

  const qrBrandConfig = getQRBrandConfig(tag.bundleType);
  const isClaimed = !!tag.ownerId;

  const handleDownloadQR = async () => {
    // Generate QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://balikin.online/p/${tag.slug}`)}&color=${qrBrandConfig.foregroundColor.replace('#', '')}&bgcolor=${qrBrandConfig.backgroundColor.replace('#', '')}`;

    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-${tag.slug}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader
        className={cn(
          'p-4',
          tag.bundleType === 'student_kit' && 'bg-blue-50',
          tag.bundleType === 'otomotif' && 'bg-red-50',
          tag.bundleType === 'pertanian' && 'bg-green-50',
          tag.bundleType === 'diklat' && 'bg-purple-50',
          !tag.bundleType && 'bg-gray-50'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{bundleConfig.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{bundleConfig.name}</h3>
              <p className="text-sm text-gray-600">{tag.slug}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/p/${tag.slug}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadQR}>
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={isClaimed ? 'default' : 'secondary'}>
              {isClaimed ? 'Claimed' : 'Unclaimed'}
            </Badge>
            {tag.onboardingCompleted && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Onboarding Done
              </Badge>
            )}
          </div>

          {/* Owner Info */}
          {isClaimed && tag.name && (
            <div>
              <p className="text-xs text-gray-500">Owner</p>
              <p className="text-sm font-medium text-gray-900">{tag.name}</p>
            </div>
          )}

          {/* Price */}
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-medium text-gray-900">
              {formatBundlePrice(bundleConfig.price)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => router.push(`/p/${tag.slug}`)}
            >
              <QrCode className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-1" />
              QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

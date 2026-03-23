import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Crown, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductType } from '@/lib/product';

interface VerifiedBadgeProps {
  tier?: 'free' | 'premium' | null;
  productType?: ProductType | null;
  isVerified?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
}

export function VerifiedBadge({
  tier = 'free',
  productType = null,
  isVerified = false,
  size = 'md',
  showTier = false,
}: VerifiedBadgeProps) {
  const isPremium = tier === 'premium';
  const isSticker = productType === 'sticker';
  const isAcrylic = productType === 'acrylic' || (productType === null && isPremium);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Premium Verified Badge - Gold
  if (isSticker) {
    return (
      <Badge
        className={cn(
          'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-700 border border-slate-300 font-medium',
          sizeClasses[size]
        )}
      >
        <BadgeCheck className={iconSize[size]} />
        Sticker Verified
      </Badge>
    );
  }

  if (isAcrylic && isVerified) {
    return (
      <Badge
        className={cn(
          'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 font-medium',
          sizeClasses[size]
        )}
      >
        <ShieldCheck className={iconSize[size]} />
        Verified Premium
      </Badge>
    );
  }

  // Premium Only Badge - Blue with Crown
  if (isAcrylic) {
    return (
      <Badge
        className={cn(
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 font-medium',
          sizeClasses[size]
        )}
      >
        <Crown className={iconSize[size]} />
        Premium
      </Badge>
    );
  }

  // Verified Only Badge - Blue/Green
  if (isVerified) {
    return (
      <Badge
        className={cn(
          'bg-blue-100 text-blue-700 border-blue-200 font-medium',
          sizeClasses[size]
        )}
      >
        <ShieldCheck className={iconSize[size]} />
        Verified
      </Badge>
    );
  }

  // Free Tier - Optional display
  if (showTier) {
    return (
      <Badge
        variant="outline"
        className={cn('text-gray-600 border-gray-300', sizeClasses[size])}
      >
        Free
      </Badge>
    );
  }

  return null;
}

// Compact version for inline use
export function VerifiedBadgeCompact({
  tier = 'free',
  productType = null,
  isVerified = false,
}: {
  tier?: 'free' | 'premium' | null;
  productType?: ProductType | null;
  isVerified?: boolean | null;
}) {
  const isPremium = tier === 'premium';
  const isSticker = productType === 'sticker';
  const isAcrylic = productType === 'acrylic' || (productType === null && isPremium);

  if (isSticker) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
        <BadgeCheck className="h-3.5 w-3.5" />
        <span>Sticker Verified</span>
      </span>
    );
  }

  if (isAcrylic && isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Verified Premium</span>
      </span>
    );
  }

  if (isAcrylic) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
        <Crown className="h-3.5 w-3.5" />
        <span>Premium</span>
      </span>
    );
  }

  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Verified</span>
      </span>
    );
  }

  return null;
}

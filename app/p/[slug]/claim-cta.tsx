'use client';

import { Tag, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Inline button component to avoid import issues
function Button({ onClick, size, className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: string }) {
  const sizeClasses = size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-4 py-2';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${sizeClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface ClaimCTAProps {
  tagId: string;
  tagName: string;
  productType?: string | null;
}

export function ClaimCTA({ tagId, tagName, productType }: ClaimCTAProps) {
  const router = useRouter();
  const isAcrylic = productType === 'acrylic';

  const handleClaim = () => {
    router.push(`/claim/${tagId}`);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className={`flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4 ${isAcrylic ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50' : ''}`}>
        <div className="flex min-w-0 items-center gap-2">
          {isAcrylic ? (
            <Award className="h-5 w-5 text-amber-600" />
          ) : (
            <Tag className="h-5 w-5 text-blue-600" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{tagName}</div>
            <div className={`text-xs ${isAcrylic ? 'text-amber-700' : 'text-gray-500'}`}>
              {isAcrylic ? '🎉 Belum ada pemilik - Klaim sekarang!' : 'Belum diklaim'}
            </div>
          </div>
        </div>
        <Button
          onClick={handleClaim}
          size="sm"
          className={`w-full sm:w-auto ${isAcrylic ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
        >
          {isAcrylic ? 'Klaim Premium' : 'Klaim Tag Ini'}
        </Button>
      </div>
    </div>
  );
}

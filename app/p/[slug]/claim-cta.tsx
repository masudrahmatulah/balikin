'use client';

import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClaimCTAProps {
  tagId: string;
  tagName: string;
}

export function ClaimCTA({ tagId, tagName }: ClaimCTAProps) {
  const router = useRouter();

  const handleClaim = () => {
    router.push(`/claim/${tagId}`);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium">{tagName}</div>
            <div className="text-xs text-gray-500">Belum diklaim</div>
          </div>
        </div>
        <Button onClick={handleClaim} size="sm">
          Klaim Tag Ini
        </Button>
      </div>
    </div>
  );
}

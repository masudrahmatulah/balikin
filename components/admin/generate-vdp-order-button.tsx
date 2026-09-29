'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GenerateVdpOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/admin/api/vdp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          batchName: `Order-${orderId.slice(0, 8)}`,
          paperSize: 'a5',
          stickerShape: 'circle',
          stickerSize: 'medium',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Gagal membuat batch VDP');
      }

      router.push(`/admin/sticker-orders/${orderId}`);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal membuat batch VDP');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button size="sm" variant="outline" disabled={isGenerating} onClick={handleGenerate}>
      {isGenerating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {isGenerating ? 'Generating VDP...' : 'Generate via VDP'}
    </Button>
  );
}

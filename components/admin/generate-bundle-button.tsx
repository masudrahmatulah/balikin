'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateSelector } from '@/components/admin/template-selector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type StickerShape, type StickerSize } from '@/lib/sticker-template';

interface GenerateBundleButtonProps {
  orderId: string;
}

export function GenerateBundleButton({ orderId }: GenerateBundleButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedShape, setSelectedShape] = useState<StickerShape>('circle');
  const [selectedSize, setSelectedSize] = useState<StickerSize>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/admin/api/generate-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          stickerShape: selectedShape,
          stickerSize: selectedSize,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Gagal membuat bundle');
      }

      setOpen(false);
      router.push('/admin/layout-editor');
    } catch (err) {
      console.error('Error generating bundle:', err);
      alert(err instanceof Error ? err.message : 'Gagal membuat bundle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          Generate Bundle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
 <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Generate Bundle Sticker</DialogTitle>
          <DialogDescription>
            Pilih template untuk bundle sticker yang akan dibuat.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <TemplateSelector
            selectedShape={selectedShape}
            selectedSize={selectedSize}
            onShapeChange={setSelectedShape}
            onSizeChange={setSelectedSize}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Bundle'
            )}
          </Button>
        </DialogFooter>
      </form>
      </DialogContent>
    </Dialog>
  );
}

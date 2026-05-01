'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, QrCode, Download, CheckCircle } from 'lucide-react';
import { BUNDLE_CONFIGS, type BundleType } from '@/lib/bundles';
import { cn } from '@/lib/utils';

interface BundleCreateFormProps {
  existingCount: number;
}

export function BundleCreateForm({ existingCount }: BundleCreateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTags, setCreatedTags] = useState<Array<{ slug: string; qrUrl: string }>>([]);
  const [formData, setFormData] = useState({
    bundleType: 'student_kit' as BundleType,
    quantity: 10,
    batchSize: 100, // For batch numbering
  });

  const bundleOptions = Object.values(BUNDLE_CONFIGS);

  const selectedBundle = BUNDLE_CONFIGS[formData.bundleType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/bundles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create bundle tags');
      }

      const data = await response.json();
      setCreatedTags(data.tags);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error creating bundle tags:', error);
      alert('Gagal membuat bundle tags. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadAll = () => {
    // Download all QR codes as individual files
    createdTags.forEach((tag, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = tag.qrUrl;
        link.download = `qr-${formData.bundleType}-${index + 1}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });
  };

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Bundle QR Codes Berhasil Dibuat!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600 mb-2">
              {createdTags.length} QR codes untuk <strong>{selectedBundle.name}</strong> telah dibuat.
            </p>
            <p className="text-sm text-gray-500">
              Batch: {formData.batchSize} - {formData.batchSize + createdTags.length - 1}
            </p>
          </div>

          {/* Preview of first few QRs */}
          <div className="grid grid-cols-4 gap-4">
            {createdTags.slice(0, 4).map((tag, index) => (
              <div key={tag.slug} className="text-center">
                <div className="bg-white p-2 rounded-lg border">
                  <img src={tag.qrUrl} alt={tag.slug} className="w-full" />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{tag.slug}</p>
              </div>
            ))}
            {createdTags.length > 4 && (
              <div className="flex items-center justify-center text-gray-500">
                <span className="text-sm">+{createdTags.length - 4} more</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleDownloadAll} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download All ({createdTags.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setCreatedTags([]);
              }}
            >
              Create More
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin/bundles')}
            >
              View All Bundles
            </Button>
          </div>

          {/* Tag List */}
          <div className="mt-6">
            <details>
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                View all created tags ({createdTags.length})
              </summary>
              <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                {createdTags.map((tag) => (
                  <div key={tag.slug} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span className="font-mono text-gray-600">{tag.slug}</span>
                    <a
                      href={tag.qrUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Bundle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bundle Type Selection */}
          <div className="space-y-3">
            <Label>Pilih Tipe Bundle</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bundleOptions.map((bundle) => (
                <button
                  key={bundle.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, bundleType: bundle.type })}
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all',
                    formData.bundleType === bundle.type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{bundle.emoji}</span>
                    {formData.bundleType === bundle.type && (
                      <Badge className="bg-blue-500">Selected</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                  <p className="text-sm text-gray-600">{bundle.description}</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    {bundle.price.toLocaleString('id-ID')}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Jumlah QR Codes</Label>
              <span className="text-sm font-medium text-blue-600">
                {formData.quantity} pcs
              </span>
            </div>
            <Slider
              value={[formData.quantity]}
              onValueChange={([value]) =>
                setFormData({ ...formData, quantity: value })
              }
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Batch Number */}
          <div className="space-y-2">
            <Label>Batch Number (Awal)</Label>
            <Input
              type="number"
              value={formData.batchSize}
              onChange={(e) =>
                setFormData({ ...formData, batchSize: parseInt(e.target.value) || 1 })
              }
              min={1}
              max={10000}
              placeholder="Contoh: 100"
            />
            <p className="text-xs text-gray-500">
              QR codes akan bernomor: {formData.batchSize} - {formData.batchSize + formData.quantity - 1}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tipe Bundle:</span>
              <span className="font-medium">
                {selectedBundle.emoji} {selectedBundle.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jumlah:</span>
              <span className="font-medium">{formData.quantity} pcs</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Batch:</span>
              <span className="font-medium">
                {formData.batchSize} - {formData.batchSize + formData.quantity - 1}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium">Total Value:</span>
                <span className="font-bold text-blue-600">
                  {(selectedBundle.price * formData.quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate {formData.quantity} QR Codes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { uploadPaymentProof } from '@/app/actions/module-purchase-actions';
import { Upload, X, Check } from 'lucide-react';

interface UploadPaymentProofProps {
  orderId: string;
}

export function UploadPaymentProof({ orderId }: UploadPaymentProofProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Upload to Vercel Blob (implement this)
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const { url } = await uploadResponse.json();

      // Update order with payment proof URL
      await uploadPaymentProof(orderId, url);

      alert('Bukti pembayaran berhasil diupload!');
      setSelectedFile(null);
      setPreview(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to upload payment proof:', error);
      alert('Gagal mengupload bukti pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile ? (
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-9"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Bukti
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          {preview && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400 max-w-32 truncate">
            {selectedFile.name}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClear}
            className="h-9"
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={uploading}
            className="h-9 bg-green-600 hover:bg-green-700"
          >
            {uploading ? (
              'Uploading...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-1" />
                Kirim
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

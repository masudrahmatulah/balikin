'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ScheduleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareCode: string;
  shareUrl: string;
  expiresAt: string;
}

export function ScheduleShareModal({
  isOpen,
  onClose,
  shareCode,
  shareUrl,
  expiresAt,
}: ScheduleShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Bagikan Jadwal Kuliah
          </DialogTitle>
          <DialogDescription>
            Bagikan data Student Kit Anda dengan teman satu kelas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-xs leading-5 text-amber-900">
            Siapa pun yang memiliki QR atau kode ini dapat mengakses jadwal kuliah, tenggat tugas, dan tautan Drive yang tersimpan hingga 7 hari. Bagikan hanya kepada orang tepercaya.
          </div>

          {/* QR Code */}
          <div className="flex justify-center rounded-lg border bg-white p-4">
            <QRCodeSVG value={shareUrl} size={256} includeMargin title="QR Code untuk mengimpor data Student Kit" />
          </div>

          {/* Share Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kode Berbagi
            </label>
            <div className="flex gap-2">
              <Input
                value={shareCode}
                readOnly
                className="font-mono text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                title="Salin kode"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Link Berbagi
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Salin link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Expiry Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Berlaku hingga:</strong> {formatDate(expiresAt)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Setelah tanggal ini, kode berbagi tidak dapat digunakan
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Cara menggunakan:
            </p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Bagikan QR code atau kode ini ke teman</li>
              <li>Teman scan QR atau masukkan kode di Student Kit</li>
              <li>Jadwal otomatis terimport ke akun mereka</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

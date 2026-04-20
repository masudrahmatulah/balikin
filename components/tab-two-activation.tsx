'use client';

import { useState } from 'react';
import { Lock, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { enableTabTwo } from '@/app/actions/modules';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface TabTwoActivationProps {
  tagId: string;
  tagName: string;
  hasTabTwoEnabled: boolean;
  slug: string;
}

export function TabTwoActivation({
  tagId,
  tagName,
  hasTabTwoEnabled,
  slug,
}: TabTwoActivationProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await enableTabTwo(tagId);
      setShowSuccess(true);
      router.refresh();
    } catch (error) {
      console.error('Failed to enable Tab 2:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  if (hasTabTwoEnabled) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="default" className="bg-emerald-600 text-white">
            <Lock className="w-3 h-3 mr-1" />
            Tab 2 Aktif
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Lihat Publik
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href={`/p/${slug}/private/student`}>
              <Lock className="w-4 h-4 mr-2" />
              Buka Privat
            </a>
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Scan QR untuk beralih antara Publik & Privat
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong className="text-blue-900">Fitur Tab 2 Belum Aktif</strong>
          <p className="text-sm text-gray-700 mt-2">
            Aktifkan untuk menambahkan modul privat (Student Kit, Otomotif, dll) yang hanya bisa diakses oleh Anda.
          </p>
        </AlertDescription>
      </Alert>

      <Button
        onClick={handleEnable}
        disabled={isEnabling}
        className="w-full sm:w-auto"
        size="sm"
      >
        {isEnabling ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mengaktifkan...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Aktifkan Tab 2
          </>
        )}
      </Button>

      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 space-y-2">
            <p className="font-medium">Tab 2 berhasil diaktifkan!</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Scan QR tag untuk melihat Tab Publik & Tab Privat</li>
              <li>• Gunakan tombol di atas untuk akses cepat dari dashboard</li>
              <li>• Data privat aman & tidak terindeks mesin pencari</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

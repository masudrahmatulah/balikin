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
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle } from 'lucide-react';
import { importSchedule } from '@/app/actions/modules';
import { useRouter } from 'next/navigation';

interface ImportScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SchedulePreview {
  classSchedule: string;
  assignmentDeadlines: string;
  driveLinks: string;
}

export function ImportScheduleModal({
  isOpen,
  onClose,
}: ImportScheduleModalProps) {
  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<SchedulePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePreview = async () => {
    if (!shareCode.trim()) {
      setError('Masukkan kode berbagi');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch(`/api/student-kit/schedule/import/${shareCode}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kode tidak valid');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setIsLoading(true);
    setError(null);

    try {
      await importSchedule(shareCode);
      router.refresh();
      onClose();
      setPreview(null);
      setShareCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengimpor jadwal');
    } finally {
      setIsLoading(false);
    }
  };

  const parseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString || '[]');
    } catch {
      return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-green-600" />
            Import Jadwal dari Teman
          </DialogTitle>
          <DialogDescription>
            Masukkan kode berbagi untuk mengimpor jadwal kuliah
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input Share Code */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kode Berbagi
            </label>
            <div className="flex gap-2">
              <Input
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                placeholder="Masukkan 10 karakter kode"
                className="font-mono uppercase"
                maxLength={10}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePreview();
                  }
                }}
              />
              <Button
                onClick={handlePreview}
                disabled={isLoading || !shareCode.trim()}
              >
                {isLoading ? 'Memuat...' : 'Cek'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Preview Jadwal:</h3>

              {/* Class Schedule */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Jadwal Kuliah:
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {parseJSON(preview.classSchedule).length} kelas
                  </Badge>
                </div>
              </div>

              {/* Assignment Deadlines */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Deadline Tugas:
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {parseJSON(preview.assignmentDeadlines).length} tugas
                  </Badge>
                </div>
              </div>

              {/* Drive Links */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Link Drive:
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {parseJSON(preview.driveLinks).length} link
                  </Badge>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-yellow-800">
                  <strong>Perhatian:</strong> Jadwal Anda yang ada akan ditimpa
                  dengan jadwal ini.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            {preview && (
              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Mengimpor...' : 'Import Jadwal'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

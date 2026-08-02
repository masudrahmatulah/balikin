'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, MessageSquare, Send, CheckCircle2, QrCode, AlertCircle, Loader2 } from 'lucide-react';
import { reportFoundItem, getTagByQR } from '@/app/actions/mobile-report';
import Link from 'next/link';

interface FormData {
  qrCode: string;
  location: string;
  message: string;
}

interface TagInfo {
  name: string;
  slug: string;
  status: string;
}

const MAX_QR_LENGTH = 20;
const MAX_LOCATION_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 500;

export default function ReportPage() {
  const [formData, setFormData] = useState<FormData>({
    qrCode: '',
    location: '',
    message: '',
  });
  const [tagInfo, setTagInfo] = useState<TagInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isQRValid = formData.qrCode.trim().length > 0 && formData.qrCode.length <= MAX_QR_LENGTH;
  const isLocationValid = formData.location.trim().length > 0 && formData.location.length <= MAX_LOCATION_LENGTH;
  const canSubmit = isQRValid && isLocationValid && !isSubmitting;

  const handleLookupQR = useCallback(async () => {
    if (!isQRValid) {
      setError('Masukkan kode QR terlebih dahulu');
      return;
    }

    setIsLookingUp(true);
    setError(null);

    const result = await getTagByQR(formData.qrCode.trim());

    if (result.success && result.tag) {
      setTagInfo({
        name: result.tag.name,
        slug: result.tag.slug,
        status: result.tag.status,
      });
    } else {
      setError(result.error || 'QR Code tidak ditemukan');
      setTagInfo(null);
    }

    setIsLookingUp(false);
  }, [isQRValid, formData.qrCode]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isQRValid) {
      setError('Masukkan kode QR terlebih dahulu');
      return;
    }

    if (!isLocationValid) {
      setError('Masukkan lokasi penemuan');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await reportFoundItem({
      qrCode: formData.qrCode.trim(),
      location: formData.location.trim(),
      message: formData.message.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowSuccess(true);
    } else {
      setError(result.error || 'Terjadi kesalahan');
    }
  }, [isQRValid, isLocationValid, formData]);

  const resetForm = useCallback(() => {
    setShowSuccess(false);
    setFormData({ qrCode: '', location: '', message: '' });
    setTagInfo(null);
    setError(null);
  }, []);

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
            <p className="text-gray-500 mb-6">
              Terima kasih telah melaporkan temuan barang. Pemilik akan dihubungi segera.
            </p>

            {tagInfo?.status === 'lost' && (
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  Barang ini dalam status <strong>HILANG</strong>. Pemilik sangat membutuhkan bantuan Anda!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button onClick={resetForm} className="w-full">
                Laporkan Lainnya
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard">Kembali ke Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Laporkan Temuan Barang</h1>
          <p className="text-gray-600">Bantu pemilik menemukan barangnya</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Kode QR
              </CardTitle>
              <CardDescription>Masukkan kode QR dari barang yang ditemukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Contoh: ABC123XYZ"
                  value={formData.qrCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                  maxLength={MAX_QR_LENGTH}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleLookupQR}
                  disabled={isLookingUp || !isQRValid}
                >
                  {isLookingUp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Cek'
                  )}
                </Button>
              </div>

              {tagInfo && (
                <Alert className={`mt-4 ${tagInfo.status === 'lost' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  <div className="flex items-center gap-2">
                    {tagInfo.status === 'lost' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium">{tagInfo.name}</p>
                      <p className="text-xs text-gray-500">
                        Status: {tagInfo.status === 'lost' ? 'HILANG' : 'Normal'}
                      </p>
                    </div>
                  </div>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lokasi Temuan
              </CardTitle>
              <CardDescription>Saat ini barang berada dimana?</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Contoh: Lobby Gedung A, Grand Indonesia..."
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                maxLength={MAX_LOCATION_LENGTH}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Pesan Tambahan
              </CardTitle>
              <CardDescription>Info lain yang mungkin membantu (opsional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Contoh: Barang ditemukan di bangku dekat toilet lantai 2..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                maxLength={MAX_MESSAGE_LENGTH}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Kirim Laporan
              </>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Pemilik akan menerima notifikasi WhatsApp segera
          </p>
        </form>
      </div>
    </div>
  );
}

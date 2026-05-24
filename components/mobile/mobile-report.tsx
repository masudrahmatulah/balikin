'use client';

import { useState } from 'react';
import {
  Camera,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
  QrCode,
  AlertCircle,
  Loader2
} from 'lucide-react';
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

export function MobileReport() {
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

  const handleLookupQR = async () => {
    if (!formData.qrCode.trim()) {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.qrCode.trim()) {
      setError('Masukkan kode QR terlebih dahulu');
      return;
    }

    if (!formData.location.trim()) {
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
  };

  const resetForm = () => {
    setShowSuccess(false);
    setFormData({ qrCode: '', location: '', message: '' });
    setTagInfo(null);
    setError(null);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full animate-scale-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-full mb-6 shadow-lg shadow-mobile-success/30 animate-scale-fade-in stagger-delay-2">
            <CheckCircle2 className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-500 mb-6">
            Terima kasih telah melaporkan temuan barang. Pemilik akan dihubungi segera.
          </p>

          {tagInfo?.status === 'lost' && (
            <div className="bg-mobile-primary-lighter rounded-2xl p-4 mb-6" role="alert" aria-live="polite">
              <p className="text-sm text-mobile-primary">
                Barang ini dalam status <strong>HILANG</strong>. Pemilik sangat membutuhkan bantuan Anda!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-mobile-primary-light to-mobile-primary text-white rounded-2xl py-4 font-semibold shadow-lg shadow-mobile-primary/30 btn-press"
              aria-label="Laporkan barang lain"
            >
              Laporkan Lainnya
            </button>
            <Link href="/mobile" className="block">
              <button className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold btn-press">
                Kembali ke Beranda
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mobile-scroll">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Laporkan Temuan</h1>
          <p className="text-sm text-gray-500">Bantu pemilik menemukan barangnya</p>
        </div>
      </header>

      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20">
            <label className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mobile-primary-light to-mobile-primary flex items-center justify-center shadow-lg" aria-hidden="true">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                <p className="text-xs text-gray-500">Masukkan kode dari barang yang ditemukan</p>
              </div>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                id="qrCode"
                name="qrCode"
                inputMode="text"
                autoComplete="off"
                placeholder="Contoh: ABC123XYZ"
                value={formData.qrCode}
                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-primary focus:ring-2 focus:ring-mobile-primary/20 outline-none transition-all"
                aria-invalid={!!error}
                aria-describedby={error ? 'qr-error' : undefined}
              />
              <button
                type="button"
                onClick={handleLookupQR}
                disabled={isLookingUp || !formData.qrCode.trim()}
                className="bg-mobile-primary text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 btn-press"
                aria-label="Cek kode QR"
              >
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Cek'
                )}
              </button>
            </div>

            {tagInfo && (
              <div
                className={`mt-4 p-4 rounded-xl animate-fade-up-20 ${
                  tagInfo.status === 'lost'
                    ? 'bg-mobile-danger-lighter border border-mobile-danger-lighter'
                    : 'bg-mobile-success-lighter border border-mobile-success-lighter'
                }`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2">
                  {tagInfo.status === 'lost' ? (
                    <AlertCircle className="h-5 w-5 text-mobile-danger" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-mobile-success" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{tagInfo.name}</p>
                    <p className="text-xs text-gray-500">
                      {tagInfo.status === 'lost' ? 'Status: HILANG' : 'Status: Normal'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div
                id="qr-error"
                className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 text-mobile-danger flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-mobile-danger">{error}</p>
              </div>
            )}
          </div>

          <div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20 stagger-delay-1"
          >
            <label htmlFor="location" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mobile-success-light to-mobile-success flex items-center justify-center shadow-lg" aria-hidden="true">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lokasi Temuan</h3>
                <p className="text-xs text-gray-500">Saat ini barang berada dimana?</p>
              </div>
            </label>

            <input
              type="text"
              id="location"
              name="location"
              required
              inputMode="text"
              autoComplete="off"
              placeholder="Contoh: Lobby Gedung A, Grand Indonesia..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-success focus:ring-2 focus:ring-mobile-success/20 outline-none transition-all"
            />
          </div>

          <div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20 stagger-delay-2"
          >
            <label htmlFor="message" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mobile-info-light to-mobile-info flex items-center justify-center shadow-lg" aria-hidden="true">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pesan Tambahan</h3>
                <p className="text-xs text-gray-500">Info lain yang mungkin membantu</p>
              </div>
            </label>

            <textarea
              id="message"
              name="message"
              placeholder="Contoh: Barang ditemukan di bangku dekat toilet lantai 2..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-mobile-info focus:ring-2 focus:ring-mobile-info/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-4 animate-fade-up-20 stagger-delay-3">
            <button
              type="submit"
              disabled={isSubmitting || !formData.qrCode.trim() || !formData.location.trim()}
              className="w-full bg-gradient-to-r from-mobile-primary-light to-mobile-primary text-white rounded-2xl py-5 font-semibold shadow-xl shadow-mobile-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-press"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" aria-hidden="true" />
                  Kirim Laporan
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Pemilik akan menerima notifikasi WhatsApp segera
            </p>
          </div>
        </form>

        <div className="h-8" />
      </main>
    </div>
  );
}

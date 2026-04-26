'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

export function MobileReport() {
  const [formData, setFormData] = useState({
    qrCode: '',
    location: '',
    message: '',
  });
  const [tagInfo, setTagInfo] = useState<{
    name: string;
    slug: string;
    status: string;
  } | null>(null);
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

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-500 mb-6">
            Terima kasih telah melaporkan temuan barang. Pemilik akan dihubungi segera.
          </p>

          {tagInfo?.status === 'lost' && (
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                Barang ini dalam status <strong>HILANG</strong>. Pemilik sangat membutuhkan bantuan Anda!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowSuccess(false);
                setFormData({ qrCode: '', location: '', message: '' });
                setTagInfo(null);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-4 font-semibold shadow-lg shadow-blue-500/30"
            >
              Laporkan Lainnya
            </button>
            <Link href="/mobile">
              <button className="w-full bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold">
                Kembali ke Beranda
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Laporkan Temuan</h1>
          <p className="text-sm text-gray-500">Bantu pemilik menemukan barangnya</p>
        </div>
      </header>

      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* QR Code Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20"
          >
            <label className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
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
                placeholder="Contoh: ABC123XYZ"
                value={formData.qrCode}
                onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleLookupQR}
                disabled={isLookingUp || !formData.qrCode.trim()}
                className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLookingUp ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Cek'
                )}
              </button>
            </div>

            {/* Tag Info Display */}
            {tagInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`mt-4 p-4 rounded-xl ${
                  tagInfo.status === 'lost'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {tagInfo.status === 'lost' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{tagInfo.name}</p>
                    <p className="text-xs text-gray-500">
                      {tagInfo.status === 'lost' ? 'Status: HILANG' : 'Status: Normal'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Location Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20"
          >
            <label className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lokasi Temuan</h3>
                <p className="text-xs text-gray-500">Saat ini barang berada dimana?</p>
              </div>
            </label>

            <input
              type="text"
              required
              placeholder="Contoh: Lobby Gedung A, Grand Indonesia..."
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
            />
          </motion.div>

          {/* Message Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20"
          >
            <label className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pesan Tambahan</h3>
                <p className="text-xs text-gray-500">Info lain yang mungkin membantu</p>
              </div>
            </label>

            <textarea
              placeholder="Contoh: Barang ditemukan di bangku dekat toilet lantai 2..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <button
              type="submit"
              disabled={isSubmitting || !formData.qrCode.trim() || !formData.location.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl py-5 font-semibold shadow-xl shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Kirim Laporan
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Pemilik akan menerima notifikasi WhatsApp segera
            </p>
          </motion.div>
        </form>

        {/* Bottom padding for navigation */}
        <div className="h-8" />
      </main>
    </div>
  );
}

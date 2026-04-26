'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  Shield,
  MapPin,
  Clock,
  AlertTriangle,
  Gift,
  Award,
  MessageCircle,
  Phone,
  User,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

interface MobileClaimProps {
  tag: {
    id: string;
    name: string;
    status: string;
    productType: string | null;
    tier: string | null;
    isVerified: boolean;
    contactWhatsapp: string | null;
    customMessage: string | null;
    rewardNote: string | null;
    slug: string;
  };
  isLost: boolean;
  isFreeTag: boolean;
  isStickerTag: boolean;
  recentScans: Array<{
    id: string;
    city: string | null;
    scannedAt: Date | null;
  }>;
  emergencyInfo: {
    emergencyContact: string | null;
    emergencyRelation: string | null;
    emergencyPhone: string | null;
    bloodType: string | null;
    allergies: string | null;
    medicalConditions: string | null;
  } | null;
}

export function MobileClaim({
  tag,
  isLost,
  isFreeTag,
  isStickerTag,
  recentScans,
  emergencyInfo
}: MobileClaimProps) {
  const [showScans, setShowScans] = useState(false);

  const whatsappMessage = isLost
    ? `Halo, saya menemukan barang "${tag.name}" yang Anda laporkan hilang. ${tag.customMessage || ''}`
    : `Halo, saya ingin bertanya tentang tag "${tag.name}".`;

  const handleWhatsAppClick = () => {
    if (tag.contactWhatsapp) {
      const url = `https://wa.me/${tag.contactWhatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(url, '_blank');
    }
  };

  const handleEmergencyCall = () => {
    if (emergencyInfo?.emergencyPhone) {
      window.open(`tel:${emergencyInfo.emergencyPhone}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isLost
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600'
            } shadow-lg`}>
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{tag.name}</h1>
              <p className="text-sm text-gray-500">
                {isLost ? 'Barang Hilang' : 'Tag Balikin'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Status Banner */}
        {isLost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-5 shadow-xl shadow-red-500/30 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-6 w-6 text-white" />
                <span className="text-white font-bold text-lg">BARANG HILANG</span>
              </div>
              <p className="text-red-100 text-sm mb-3">
                Pemilik sedang mencari barang ini. Jika Anda menemukannya, mohon hubungi segera.
              </p>
              {tag.rewardNote && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Gift className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-medium">{tag.rewardNote}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Hero Badge - Pahlawan Penemu */}
        {!isLost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-3xl p-5 shadow-xl shadow-amber-500/30 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full" />
            </div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Award className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Terima kasih!</p>
                <p className="text-amber-100 text-sm">Anda Pahlawan Penemu</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Custom Message */}
        {tag.customMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 ${
              isLost ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <MessageCircle className={`h-5 w-5 mt-0.5 ${isLost ? 'text-red-500' : 'text-blue-500'}`} />
              <p className={`text-sm ${isLost ? 'text-red-800' : 'text-gray-700'}`}>
                {tag.customMessage}
              </p>
            </div>
          </motion.div>
        )}

        {/* Emergency Information */}
        {emergencyInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20"
          >
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Info Darurat
            </h3>
            <div className="space-y-3">
              {emergencyInfo.emergencyContact && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Kontak Darurat</span>
                  <span className="text-sm font-medium text-gray-900">
                    {emergencyInfo.emergencyContact}
                    {emergencyInfo.emergencyRelation && ` (${emergencyInfo.emergencyRelation})`}
                  </span>
                </div>
              )}
              {emergencyInfo.emergencyPhone && (
                <button
                  onClick={handleEmergencyCall}
                  className="w-full flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 active:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {emergencyInfo.emergencyPhone}
                    </span>
                  </div>
                  <span className="text-xs text-green-600">Panggil</span>
                </button>
              )}
              {emergencyInfo.bloodType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Golongan Darah</span>
                  <span className="text-sm font-bold text-red-600">{emergencyInfo.bloodType}</span>
                </div>
              )}
              {emergencyInfo.allergies && (
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Alergi</p>
                  <p className="text-sm text-red-700">{emergencyInfo.allergies}</p>
                </div>
              )}
              {emergencyInfo.medicalConditions && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Kondisi Medis</p>
                  <p className="text-sm text-amber-700">{emergencyInfo.medicalConditions}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Tentang Tag Ini</h3>
          </div>
          <p className="text-sm text-gray-600">
            {isFreeTag
              ? 'Ini adalah digital tag gratis milik pengguna Balikin.'
              : isStickerTag
              ? 'Pemilik menggunakan stiker Balikin yang tahan air dan anti-UV.'
              : 'Pemilik menggunakan gantungan kunci premium Balikin dengan perlindungan maksimal.'}
          </p>
        </motion.div>

        {/* Recent Scans (for lost items) */}
        {isLost && !isFreeTag && recentScans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden"
          >
            <button
              onClick={() => setShowScans(!showScans)}
              className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-gray-900">Riwayat Scan</span>
                <span className="text-xs text-gray-400">({recentScans.length})</span>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-gray-400 transition-transform ${showScans ? 'rotate-90' : ''}`}
              />
            </button>
            {showScans && (
              <div className="px-5 pb-5 space-y-2">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">
                      {scan.city || 'Lokasi tidak diketahui'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {scan.scannedAt
                        ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* WhatsApp CTA Button */}
        {tag.contactWhatsapp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-2"
          >
            <button
              onClick={handleWhatsAppClick}
              className={`w-full rounded-2xl py-5 font-semibold shadow-xl flex items-center justify-center gap-3 ${
                isLost
                  ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/30 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/30 text-white'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              {isLost ? 'Hubungi Pemilik Sekarang' : 'Chat via WhatsApp'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Dengan menekan tombol, Anda akan diarahkan ke WhatsApp
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Powered by Balikin</p>
          <p className="text-xs text-gray-300 mt-1">Smart Lost & Found Platform</p>
        </div>
      </main>
    </div>
  );
}

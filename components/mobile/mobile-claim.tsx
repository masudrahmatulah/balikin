'use client';

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
  ChevronRight,
  Lock
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  isExpired: boolean;
  isUnclaimed: boolean;
  recentScans: Array<{
    id: string;
    city: string | null;
    scannedAt: Date | null;
  }>;
  emergencyInfo: {
    emergencyContact: string | null;
    emergencyContactName: string | null;
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
  isExpired,
  isUnclaimed,
  recentScans,
  emergencyInfo
}: MobileClaimProps) {
  const router = useRouter();
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
    if (emergencyInfo?.emergencyContact) {
      window.open(`tel:${emergencyInfo.emergencyContact}`, '_blank');
    }
  };

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50 px-4 py-8">
        <main className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-xl">
          <Clock className="mx-auto h-10 w-10 text-amber-600" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Tag Sudah Kedaluwarsa</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Masa aktif digital tag free ini adalah 7 hari. Pemilik perlu melakukan upgrade ke premium agar tag dapat digunakan kembali.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      {/* Header with Glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isLost
                ? 'bg-gradient-to-br from-mobile-danger-light to-mobile-danger'
                : 'bg-gradient-to-br from-mobile-primary-light to-mobile-primary'
            } shadow-lg`}>
              <QrCode className="h-6 w-6 text-white" aria-hidden="true" />
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
        {/* Activation CTA - shown on first scan for unclaimed tags, requires PIN to activate */}
        {isUnclaimed && (
          <div className="bg-gradient-to-br from-mobile-primary-light to-mobile-primary rounded-3xl p-5 shadow-xl shadow-mobile-primary/30 border border-white/20 relative overflow-hidden animate-fade-up-20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-6 w-6 text-white" aria-hidden="true" />
                <span className="text-white font-bold text-lg">Tag Ini Belum Aktif</span>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Aktifkan tag ini dengan PIN yang ada di dalam kemasan untuk mulai melindungi barang Anda.
              </p>
              <button
                onClick={() => router.push(`/claim/${tag.id}`)}
                className="w-full rounded-2xl py-4 font-semibold bg-white text-mobile-primary shadow-lg flex items-center justify-center gap-2 btn-press"
                aria-label="Aktifkan tag ini"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Aktivasi Tag Ini
              </button>
            </div>
          </div>
        )}

        {/* Status Banner */}
        {isLost && (
          <div className="bg-gradient-to-br from-mobile-danger-light to-mobile-danger rounded-3xl p-5 shadow-xl shadow-mobile-danger/30 border border-white/20 relative overflow-hidden animate-fade-up-20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
                <span className="text-white font-bold text-lg">BARANG HILANG</span>
              </div>
              <p className="text-rose-100 text-sm mb-3">
                Pemilik sedang mencari barang ini. Jika Anda menemukannya, mohon hubungi segera.
              </p>
              {tag.rewardNote && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2">
                  <Gift className="h-4 w-4 text-white" aria-hidden="true" />
                  <span className="text-white text-sm font-medium">{tag.rewardNote}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hero Badge - Pahlawan Penemu */}
        {!isLost && (
          <div className="bg-gradient-to-br from-mobile-warning-light to-mobile-warning rounded-3xl p-5 shadow-xl shadow-mobile-warning/30 border border-white/20 relative overflow-hidden animate-fade-up-20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white rounded-full" />
            </div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Award className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-white font-bold">Terima kasih!</p>
                <p className="text-amber-100 text-sm">Anda Pahlawan Penemu</p>
              </div>
            </div>
          </div>
        )}

        {/* Custom Message */}
        {tag.customMessage && (
          <div className={`bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 ${
            isLost ? 'border-l-4 border-l-mobile-danger' : 'border-l-4 border-l-mobile-primary'
          } animate-fade-up-20 stagger-delay-1`}>
            <div className="flex items-start gap-3">
              <MessageCircle className={`h-5 w-5 mt-0.5 ${isLost ? 'text-mobile-danger' : 'text-mobile-primary'}`} aria-hidden="true" />
              <p className={`text-sm ${isLost ? 'text-mobile-danger' : 'text-gray-700'}`}>
                {tag.customMessage}
              </p>
            </div>
          </div>
        )}

        {/* Emergency Information */}
        {emergencyInfo && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20 stagger-delay-2">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-mobile-primary" aria-hidden="true" />
              Info Darurat
            </h3>
            <div className="space-y-3">
              {emergencyInfo.emergencyContactName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Kontak Darurat</span>
                  <span className="text-sm font-medium text-gray-900">
                    {emergencyInfo.emergencyContactName}
                  </span>
                </div>
              )}
              {emergencyInfo.emergencyContact && (
                <button
                  onClick={handleEmergencyCall}
                  className="w-full flex items-center justify-between bg-mobile-success-lighter rounded-xl px-4 py-3 active:bg-mobile-success-lighter transition-colors btn-press"
                  aria-label={`Panggil ${emergencyInfo.emergencyContact}`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-mobile-success" aria-hidden="true" />
                    <span className="text-sm font-medium text-mobile-success">
                      {emergencyInfo.emergencyContact}
                    </span>
                  </div>
                  <span className="text-xs text-mobile-success">Panggil</span>
                </button>
              )}
              {emergencyInfo.bloodType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Golongan Darah</span>
                  <span className="text-sm font-bold text-mobile-danger">{emergencyInfo.bloodType}</span>
                </div>
              )}
              {emergencyInfo.allergies && (
                <div className="bg-mobile-danger-lighter rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Alergi</p>
                  <p className="text-sm text-mobile-danger">{emergencyInfo.allergies}</p>
                </div>
              )}
              {emergencyInfo.medicalConditions && (
                <div className="bg-mobile-warning-lighter rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Kondisi Medis</p>
                  <p className="text-sm text-mobile-warning">{emergencyInfo.medicalConditions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white/20 animate-fade-up-20 stagger-delay-3">
          <div className="flex items-center gap-3 mb-3">
            <QrCode className="h-5 w-5 text-mobile-primary" aria-hidden="true" />
            <h3 className="font-bold text-gray-900">Tentang Tag Ini</h3>
          </div>
          <p className="text-sm text-gray-600">
            {isFreeTag
              ? 'Ini adalah digital tag gratis milik pengguna Balikin.'
              : isStickerTag
              ? 'Pemilik menggunakan stiker Balikin yang tahan air dan anti-UV.'
              : 'Pemilik menggunakan gantungan kunci premium Balikin dengan perlindungan maksimal.'}
          </p>
        </div>

        {/* Recent Scans (for lost items) */}
        {isLost && !isFreeTag && recentScans.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-white/20 overflow-hidden animate-fade-up-20 stagger-delay-4">
            <button
              onClick={() => setShowScans(!showScans)}
              className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors btn-press"
              aria-expanded={showScans}
              aria-controls="scan-history"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-mobile-info" aria-hidden="true" />
                <span className="font-bold text-gray-900">Riwayat Scan</span>
                <span className="text-xs text-gray-400">({recentScans.length})</span>
              </div>
              <ChevronRight
                className={`h-5 w-5 text-gray-400 transition-transform ${showScans ? 'rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
            {showScans && (
              <div id="scan-history" className="px-5 pb-5 space-y-2">
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
          </div>
        )}

        {/* WhatsApp CTA Button */}
        {tag.contactWhatsapp && (
          <div className="pt-2 animate-fade-up-20 stagger-delay-5">
            <button
              onClick={handleWhatsAppClick}
              className={`w-full rounded-2xl py-5 font-semibold shadow-xl flex items-center justify-center gap-3 btn-press ${
                isLost
                  ? 'bg-gradient-to-r from-mobile-danger-light to-mobile-danger shadow-mobile-danger/30 text-white'
                  : 'bg-gradient-to-r from-mobile-success-light to-mobile-success shadow-mobile-success/30 text-white'
              }`}
              aria-label={isLost ? 'Hubungi pemilik via WhatsApp' : 'Chat via WhatsApp'}
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              {isLost ? 'Hubungi Pemilik Sekarang' : 'Chat via WhatsApp'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Dengan menekan tombol, Anda akan diarahkan ke WhatsApp
            </p>
          </div>
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

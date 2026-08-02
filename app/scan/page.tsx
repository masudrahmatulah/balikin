'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, Camera, ArrowLeft, Home } from 'lucide-react';

export default function ScanPage() {
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if device has camera support
    const checkCamera = async () => {
      try {
        const stream = await navigator.mediaDevices?.getUserMedia({ video: true });
        if (stream) {
          setHasCamera(true);
          // Stop the stream immediately since we're just checking
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.log('Camera not available:', error);
        setHasCamera(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkCamera();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-mobile-primary-lighter text-mobile-primary rounded-3xl mb-6 shadow-lg shadow-mobile-primary/30">
            {isLoading ? (
              <div className="animate-spin h-12 w-12 border-4 border-mobile-primary border-t-transparent rounded-full" />
            ) : hasCamera ? (
              <Camera className="h-12 w-12" />
            ) : (
              <QrCode className="h-12 w-12" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            QR Scanner
          </h1>

          {/* Description */}
          {isLoading ? (
            <p className="text-gray-600 mb-8">Memeriksa kamera...</p>
          ) : hasCamera ? (
            <div className="space-y-6">
              <p className="text-gray-600 mb-8">
                Fitur scanner QR akan segera hadir. Anda akan bisa scan QR code tag Balikin langsung dari aplikasi.
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-800">
                  💡 <strong>Info:</strong> Saat ini, Anda bisa menggunakan kamera bawaan HP untuk scan QR code pada tag Balikin.
                </p>
              </div>

              <Link href="/mobile/report">
                <button className="bg-mobile-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-mobile-primary/30 btn-press">
                  Laporkan Temuan Barang
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 mb-8">
                Kamera tidak terdeteksi pada perangkat ini. Pastikan Anda memberikan izin akses kamera.
              </p>

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-8">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Perhatian:</strong> Pastikan browser Anda memiliki izin akses kamera.
                </p>
              </div>

              <Link href="/mobile">
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold btn-press flex items-center justify-center gap-2 mx-auto">
                  <Home className="h-5 w-5" />
                  Ke Beranda
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

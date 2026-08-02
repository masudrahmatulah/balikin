'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, Camera, ArrowLeft, Home } from 'lucide-react';

export default function MobileScanPage() {
  const [hasCamera, setHasCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const stream = await navigator.mediaDevices?.getUserMedia({ video: true });
        if (stream) {
          setHasCamera(true);
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
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile" className="inline-flex items-center gap-2 text-mobile-primary">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-mobile-primary-light to-mobile-primary text-white rounded-3xl mb-6 shadow-xl shadow-mobile-primary/30">
            {isLoading ? (
              <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full" />
            ) : hasCamera ? (
              <Camera className="h-12 w-12" />
            ) : (
              <QrCode className="h-12 w-12" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            QR Scanner
          </h1>

          {isLoading ? (
            <p className="text-gray-600 mb-8">Memeriksa kamera...</p>
          ) : hasCamera ? (
            <div className="space-y-6">
              <p className="text-gray-600 mb-8">
                Fitur scanner QR akan segera hadir. Anda akan bisa scan QR code tag Balikin langsung dari aplikasi.
              </p>

              <div className="bg-mobile-info-lighter border border-mobile-info-lighter rounded-2xl p-4 mb-8">
                <p className="text-sm text-mobile-info">
                  💡 <strong>Info:</strong> Saat ini, Anda bisa menggunakan kamera bawaan HP untuk scan QR code pada tag Balikin.
                </p>
              </div>

              <Link href="/mobile/report" className="block">
                <div className="bg-mobile-primary text-white px-6 py-3 rounded-xl text-center font-semibold shadow-lg shadow-mobile-primary/30 btn-press">
                  Laporkan Temuan Barang
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 mb-8">
                Kamera tidak terdeteksi pada perangkat ini. Pastikan Anda memberikan izin akses kamera.
              </p>

              <div className="bg-mobile-warning-lighter border border-mobile-warning-lighter rounded-2xl p-4 mb-8">
                <p className="text-sm text-mobile-warning">
                  ⚠️ <strong>Perhatian:</strong> Pastikan browser Anda memiliki izin akses kamera.
                </p>
              </div>

              <Link href="/mobile" className="block">
                <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl text-center font-semibold btn-press flex items-center justify-center gap-2 mx-auto">
                  <Home className="h-5 w-5" />
                  Ke Beranda
                </div>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

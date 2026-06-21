import Link from 'next/link';
import { ArrowLeft, Users, Smartphone, QrCode, MessageCircle } from 'lucide-react';

export default function MobileHowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Hero */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cara Kerja Balikin</h1>
          <p className="text-sm text-gray-600">Lindungi barang berharga Anda dengan 3 langkah mudah</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {[
            {
              step: 1,
              icon: QrCode,
              title: 'Buat Tag QR',
              description: 'Daftar gratis dan buat tag QR unik untuk barang berharga Anda seperti kunci, dompet, atau laptop.',
              color: 'from-mobile-primary-light to-mobile-primary',
            },
            {
              step: 2,
              icon: Smartphone,
              title: 'Tempel pada Barang',
              description: 'Cetak dan tempel stiker QR, atau gunakan gantungan kunci akrilik pada barang yang ingin Anda lindungi.',
              color: 'from-mobile-success-light to-mobile-success',
            },
            {
              step: 3,
              icon: MessageCircle,
              title: 'Scan & Terhubung',
              description: 'Jika barang hilang dan ditemukan, penemu scan QR untuk menghubungi Anda secara anonim dan aman.',
              color: 'from-mobile-info-light to-mobile-info',
            },
          ].map((item) => (
            <div key={item.step} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 bg-mobile-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {item.step}
                    </span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Fitur Utama</h2>

          <div className="space-y-3">
            {[
              '🔒 Privasi terjamin - nomor WhatsApp tidak ditampilkan',
              '📱 Tanpa aplikasi - scan langsung dengan kamera HP',
              '♾️ Premium lifetime - bayar sekali, aktif selamanya',
              '📍 Tracking lokasi - ketahui lokasi scan',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-mobile-success">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mulai Sekarang</h2>
          <p className="text-sm text-gray-600 mb-4">
            Daftar gratis dan buat tag QR pertama Anda sekarang.
          </p>
          <Link href="/mobile/new" className="block">
            <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press">
              Buat Tag Gratis
            </div>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

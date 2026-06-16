import Link from 'next/link';
import { ArrowLeft, Users, Shield, Smartphone, Heart } from 'lucide-react';

export default function MobileAboutPage() {
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
        <div className="bg-gradient-to-br from-mobile-primary to-mobile-primary-dark rounded-3xl p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Tentang Balikin</h1>
          <p className="text-blue-100">Solusi Pintar Amankan Barang Berharga</p>
        </div>

        {/* Problem */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Masalah yang Kami Selesaikan</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Setiap hari, ribuan barang berharga hilang. Masalahnya bukan karena orang tidak ingin mengembalikannya, melainkan karena tidak ada cara yang aman dan praktis bagi penemu untuk menghubungi pemilik.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light">
          <h2 className="text-lg font-bold text-mobile-primary mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Misi Kami
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Platform lost & found modern Indonesia dengan QR Smart Tag. Jembatan digital aman, cepat, dan anonim untuk mempertemukan Anda dengan penemu barang.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cara Kerja</h2>

          <div className="space-y-4">
            {[
              { step: 1, title: 'Tempel Tag', desc: 'Tempel stiker atau gantungan kunci QR pada barang berharga Anda.' },
              { step: 2, title: 'Scan Anonim', desc: 'Penemu scan QR code menggunakan kamera ponsel.' },
              { step: 3, title: 'Terhubung Instan', desc: 'Penemu dapat mengirim pesan kepada Anda secara anonim.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-mobile-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nilai Utama</h2>

          <div className="space-y-3">
            {[
              { icon: Shield, title: 'Keamanan Privasi', desc: 'Data pribadi Anda aman dan tidak ditampilkan ke publik.' },
              { icon: Smartphone, title: 'Kemudahan Akses', desc: 'Tanpa aplikasi, cukup scan QR code.' },
              { icon: Infinite, title: 'Premium Lifetime', desc: 'Bayar sekali, nikmati selamanya.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-mobile-primary-lighter text-mobile-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-success-light to-white rounded-2xl p-5 shadow-lg border border-mobile-success-light">
          <h2 className="text-lg font-bold text-mobile-success mb-2">Mulai Lindungi Barang Anda</h2>
          <p className="text-sm text-gray-700 mb-4">
            Kehilangan barang menguras waktu dan energi. Mencegah jauh lebih baik daripada mencari.
          </p>
          <Link href="/mobile/new" className="block">
            <div className="bg-mobile-success text-white py-3 rounded-xl text-center font-semibold btn-press">
              Buat Tag Sekarang
            </div>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

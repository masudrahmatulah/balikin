import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function MobileTermsPage() {
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
          <FileText className="h-10 w-10 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
          <p className="text-blue-100 text-sm">Balikin.online</p>
          <p className="text-blue-200 text-xs mt-2">Pembaruan: Juni 2026</p>
        </div>

        {/* Summary */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Penggunaan Layanan</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Dengan menggunakan layanan Balikin, Anda setuju dengan syarat dan ketentuan yang berlaku. Layanan kami tersedia "sebagaimana adanya".
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Akun Premium Lifetime</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Pembelian tag fisik memberikan akses premium selamanya selama platform beroperasi. Tidak ada biaya bulanan atau tahunan.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Tanggung Jawab</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Balikin memaksimalkan peluang pengembalian barang tetapi tidak menjamin barang hilang akan ditemukan atau dikembalikan.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Konten Pengguna</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Anda bertanggung jawab atas konten yang Anda unggah, termasuk foto profil dan informasi tag.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Baca Syarat Lengkap</h2>
          <p className="text-sm text-gray-600 mb-4">
            Dapatkan informasi lebih lengkap tentang syarat dan ketentuan layanan kami.
          </p>
          <Link href="/terms-of-service" className="block">
            <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press">
              Baca Versi Lengkap
            </div>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

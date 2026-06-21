import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function MobilePrivacyPage() {
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
          <Shield className="h-10 w-10 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-2">Kebijakan Privasi</h1>
          <p className="text-blue-100 text-sm">Balikin.online</p>
          <p className="text-blue-200 text-xs mt-2">Pembaruan: Juni 2026</p>
        </div>

        {/* Summary */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Perlindungan Data Anda</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Balikin berkomitmen melindungi data pribadi Anda sesuai UU PDP Indonesia. Data Anda dienkripsi dan tidak pernah dijual ke pihak ketiga.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Data yang Kami Kumpulkan</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Nama dan email (untuk akun)</li>
              <li>• Nomor WhatsApp (untuk notifikasi)</li>
              <li>• Data lokasi (saat scan)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Keamanan</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Nomor WhatsApp Anda tidak pernah ditampilkan ke publik. Penemu hanya melihat tombol "Hubungi Pemilik" yang dijembatani melalui server kami.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Hak Anda</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Anda dapat mengakses, mengubah, atau menghapus data Anda kapan saja melalui dashboard akun.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Baca Kebijakan Lengkap</h2>
          <p className="text-sm text-gray-600 mb-4">
            Dapatkan informasi lebih lengkap tentang kebijakan privasi kami.
          </p>
          <Link href="/privacy-policy" className="block">
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

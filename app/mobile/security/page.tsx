import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Server, Eye } from 'lucide-react';

export default function MobileSecurityPage() {
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
          <h1 className="text-2xl font-bold text-white mb-2">Keamanan</h1>
          <p className="text-blue-100 text-sm">Bagaimana kami melindungi data Anda</p>
        </div>

        {/* Security Features */}
        <div className="space-y-3">
          {[
            {
              icon: Lock,
              title: 'Enkripsi Data',
              description: 'Semua data pribadi dienkripsi dengan standar industri untuk melindungi informasi Anda.',
              color: 'from-mobile-primary-light to-mobile-primary',
            },
            {
              icon: Eye,
              title: 'Privasi-by-Design',
              description: 'Nomor WhatsApp dan kontak Anda tidak pernah ditampilkan ke publik.',
              color: 'from-mobile-success-light to-mobile-success',
            },
            {
              icon: Server,
              title: 'Hosting Aman',
              description: 'Data disimpan di server Vercel dengan keamanan tingkat enterprise.',
              color: 'from-mobile-info-light to-mobile-info',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Best Practices */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Tips Keamanan</h2>

          <div className="space-y-2">
            {[
              'Gunakan password yang kuat dan unik',
              'Jangan bagikan akun dengan orang lain',
              'Log out setelah menggunakan perangkat publik',
              'Perbarui informasi kontak secara berkala',
            ].map((tip) => (
              <div key={tip} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-mobile-success">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report Issue */}
        <div className="bg-gradient-to-br from-mobile-warning-light to-white rounded-2xl p-5 shadow-lg border border-mobile-warning-light">
          <h2 className="text-lg font-bold text-mobile-warning mb-2">Temukan Masalah Keamanan?</h2>
          <p className="text-sm text-gray-700 mb-4">
            Laporkan masalah keamanan kepada kami segera.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER || '6281234567890'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-mobile-warning text-white py-3 rounded-xl text-center font-semibold btn-press">
              Laporkan Masalah
            </div>
          </a>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

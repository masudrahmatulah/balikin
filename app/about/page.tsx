import type { Metadata } from "next";
import { WebPageJsonLd, OrganizationJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Tentang Kami – Balikin.online | Solusi Pintar Amankan Barang Berharga",
  description: "Tentang Balikin.online – Platform smart lost & found Indonesia dengan teknologi QR Smart Tag. Solusi aman melindungi barang hilang, kunci, dompet, laptop, hingga hewan peliharaan kesayangan Anda.",
  keywords: [
    "tentang balikin",
    "about balikin",
    "balikin online",
    "smart lost and found indonesia",
    "qr tag anti hilang",
    "stiker qr code",
    "gantungan kunci qr",
    "solusi kehilangan barang",
    "cara mengamankan barang",
    "pelindung barang hilang",
    "sistem penemu barang",
    "teknologi qr code",
    "tag pintar indonesia",
    "lost found jakarta",
    "lost found bandung",
    "lost found surabaya",
    "stiker anti hilang",
    "aksesoris anti hilang",
    "qr smart tag",
    "pengaman barang",
  ],
  openGraph: {
    title: "Tentang Kami – Balikin.online | Solusi Pintar Amankan Barang Berharga",
    description: "Platform smart lost & found Indonesia dengan teknologi QR Smart Tag. Solusi aman melindungi barang hilang tanpa mengorbankan privasi.",
    type: "website",
  },
  alternates: {
    canonical: "/about",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebPageJsonLd
        name="Tentang Balikin - Solusi Pintar Amankan Barang Berharga"
        description="Tentang Balikin.online – Platform smart lost & found Indonesia dengan teknologi QR Smart Tag. Solusi aman melindungi barang hilang, kunci, dompet, laptop, hingga hewan peliharaan."
      />
      <div className="public-content-page min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100">
        <SiteHeader />
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-brand-navy to-brand-red text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Balikin.online</h1>
            <p className="text-xl text-red-100">Solusi Pintar Amankan Barang Berharga Anda</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Problem Statement */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-justify">
              Pernahkah Anda merasakan kepanikan luar biasa saat menyadari bahwa kunci kendaraan, dompet, laptop, atau bahkan hewan peliharaan kesayangan Anda hilang?
            </p>
            <p className="text-gray-700 leading-relaxed text-justify mt-4">
              Setiap hari, ribuan barang berharga hilang di fasilitas umum. Masalahnya bukan karena orang lain tidak mau mengembalikannya, melainkan karena tidak ada cara yang aman dan praktis bagi penemu barang untuk menghubungi pemiliknya. Menuliskan nomor HP atau alamat rumah secara langsung pada barang bawaan juga sangat berbahaya bagi privasi dan keamanan Anda.
            </p>
            <p className="text-gray-700 leading-relaxed text-justify mt-4 font-semibold text-brand-red-dark">
              Dari kegelisahan itulah, Balikin.online lahir.
            </p>
          </section>

          {/* Mission */}
          <section className="mb-8 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:border-green-900/60 dark:from-green-950/40 dark:to-slate-900">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-green-800 dark:text-green-200">
              <span className="text-3xl">🚀</span>
              Misi Kami: "Mengembalikan yang Berharga dengan Menjaga Privasi"
            </h2>
            <p className="text-gray-800 leading-relaxed text-justify mb-4 dark:text-slate-200">
              Balikin.online adalah platform <strong>lost and found (penemuan barang hilang)</strong> modern di Indonesia yang memanfaatkan teknologi <strong>QR Smart Tag</strong>. Kami hadir sebagai jembatan digital yang aman, cepat, dan anonim untuk mempertemukan Anda dengan penemu barang tanpa mengorbankan privasi data pribadi Anda.
            </p>
            <p className="text-gray-800 leading-relaxed text-justify dark:text-slate-200">
              Kami percaya bahwa kejujuran itu ada di mana-mana. Tugas Balikin adalah menyediakan sarana terbaik agar kejujuran tersebut bisa tersalurkan dengan cara yang paling aman dan mudah.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">🛠️</span>
              Bagaimana Balikin.online Bekerja?
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Kami menyederhanakan proses pencarian barang hilang dalam tiga langkah mudah:
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-6 dark:bg-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  1
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Tempel Tag Pintar</h3>
                  <p className="text-gray-700 dark:text-slate-300">Anda menempelkan stiker, gantungan kunci akrilik, atau menyematkan QR Smart Tag Balikin pada barang berharga Anda (laptop, dompet, kunci, tas, dll).</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-6 dark:bg-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  2
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Scan Anonim</h3>
                  <p className="text-gray-700 dark:text-slate-300">Jika barang tersebut tercecer dan ditemukan oleh seseorang, penemu cukup memindai (scan) kode QR tersebut menggunakan kamera ponsel mereka.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg bg-slate-50 p-6 dark:bg-slate-800">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  3
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Terhubung Instan</h3>
                  <p className="text-gray-700 dark:text-slate-300">Penemu dapat langsung mengirimkan pesan kepada Anda (melalui sistem notifikasi kami atau WhatsApp) secara anonim. Nomor WhatsApp dan data pribadi asli Anda akan tetap aman dan terjaga di sistem kami.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">💎</span>
              Nilai Utama yang Kami Pegang Teguh
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="mb-2 text-lg font-semibold text-brand-navy dark:text-white">Keamanan Privasi</h3>
                <p className="text-sm text-gray-800 dark:text-slate-200">Kami tidak pernah menampilkan nomor telepon, email, atau alamat rumah Anda ke halaman publik. Keamanan data Anda adalah prioritas nomor satu kami.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Kemudahan Akses</h3>
                <p className="text-sm text-gray-700 dark:text-slate-300">Penemu barang tidak perlu mengunduh aplikasi tambahan untuk melaporkan barang yang mereka temukan. Cukup scan dan langsung bisa menghubungi Anda.</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="text-3xl mb-3">♾️</div>
                <h3 className="mb-2 text-lg font-semibold text-brand-navy dark:text-white">Premium Lifetime</h3>
                <p className="text-sm text-gray-800 dark:text-slate-200">Kami tidak menyukai biaya bulanan yang mengikat. Cukup beli tag fisik sekali, dan nikmati fitur premium kami selamanya selama platform beroperasi.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-8 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:border-green-900/60 dark:from-green-950/40 dark:to-slate-900">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-green-800 dark:text-green-200">
              <span className="text-3xl">🤝</span>
              Mari Menjadi Bagian dari Ekosistem Balikin
            </h2>
            <p className="mb-4 text-justify leading-relaxed text-gray-700 dark:text-slate-300">
              Kehilangan barang sering kali menguras energi, waktu, dan biaya yang tidak sedikit. Bersama Balikin.online, mari kita bangun budaya saling membantu yang lebih aman dan terorganisir dengan bantuan teknologi digital.
            </p>
            <p className="font-semibold leading-relaxed text-justify text-green-800 dark:text-green-200">
              Lindungi barang berharga Anda sekarang juga sebelum terlambat. Karena mencegah kehilangan jauh lebih menenangkan daripada mencari yang telah hilang.
            </p>
          </section>

          {/* Contact Section */}
          <section className="mb-8 rounded-xl bg-gradient-to-br from-brand-navy to-brand-red p-8 text-white shadow-lg shadow-red-900/20">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <span className="text-3xl">📞</span>
              Hubungi Tim Balikin
            </h2>
            <p className="mb-6 text-justify leading-relaxed text-red-100">
              Kami selalu terbuka untuk kolaborasi, saran, atau bantuan teknis. Jangan ragu untuk menyapa kami melalui:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="text-sm text-red-200">Situs Resmi</p>
                  <a href="https://balikin.online" className="text-white font-semibold hover:underline">balikin.online</a>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-red-200">Kemitraan & Dukungan</p>
                  <a href="mailto:support@balikin.online" className="text-white font-semibold hover:underline">support@balikin.online</a>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="text-sm text-red-200">Instagram</p>
                  <a href="https://instagram.com/balikin.online" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:underline">@balikin.online</a>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content (Hidden but valuable for search engines) */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Solusi Anti Hilang Terlengkap di Indonesia</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Balikin.online menyediakan berbagai produk perlindungan barang termasuk stiker QR code tahan air, gantungan kunci akrilik premium, dan tag identifikasi digital untuk hewan peliharaan. Sistem kami telah membantu ribuan pengguna di Indonesia—mulai dari Jakarta, Bandung, Surabaya, hingga kota-kota besar lainnya—untuk melindungi kunci kendaraan, dompet, laptop, tas, dan barang berharga lainnya dari risiko kehilangan. Dengan teknologi QR Smart Tag, penemu barang dapat dengan mudah menghubungi pemilik tanpa perlu mengungkapkan informasi kontak sensitif.
            </p>
          </section>

          {/* Footer Note */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>© 2026 Balikin.online. Membangun Ekosistem Lost & Found yang Lebih Aman di Indonesia.</p>
          </div>
        </main>
      </div>
    </>
  );
}

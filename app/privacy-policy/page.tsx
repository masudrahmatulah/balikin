import type { Metadata } from "next";
import { WebPageJsonLd, OrganizationJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Kebijakan Privasi – Balikin.online | Perlindungan Data Pribadi UU PDP",
  description: "Kebijakan privasi Balikin.online – Perlindungan data pribadi Anda sesuai UU PDP Indonesia. Enkripsi WhatsApp, keamanan lokasi GPS, dan tanpa penjualan data ke pihak ketiga.",
  keywords: [
    "kebijakan privasi balikin",
    "privacy policy balikin",
    "privasi data balikin",
    "perlindungan data pribadi",
    "uu pdp indonesia",
    "enkripsi whatsapp",
    "keamanan lokasi gps",
    "tanpa jual data",
    "hak data pribadi",
    "kebijakan cookie",
  ],
  openGraph: {
    title: "Kebijakan Privasi – Balikin.online | Perlindungan Data Pribadi",
    description: "Kebijakan privasi Balikin.online – Perlindungan data pribadi sesuai UU PDP Indonesia dengan enkripsi WhatsApp dan keamanan lokasi GPS.",
    type: "website",
  },
  alternates: {
    canonical: "/privacy-policy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebPageJsonLd
        name="Kebijakan Privasi - Balikin"
        description="Kebijakan privasi Balikin.online – Perlindungan data pribadi Anda sesuai UU PDP Indonesia"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Kebijakan Privasi</h1>
            <p className="text-xl text-blue-100">Balikin.online</p>
            <p className="mt-4 text-blue-200 text-sm">Pembaruan Terakhir: Juni 2026</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-justify">
              Di Balikin.online, kami menempatkan perlindungan privasi dan keamanan data pribadi Anda sebagai prioritas nomor satu. Sebagai platform pencarian barang hilir (lost and found) modern yang memanfaatkan teknologi QR Smart Tag, kami berkomitmen penuh untuk menjaga setiap data kontak, informasi barang, hingga riwayat pemindaian tetap aman dan rahasia.
            </p>
            <p className="text-gray-700 leading-relaxed text-justify mt-4">
              Kebijakan Privasi ini disusun berdasarkan ketentuan hukum Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) di Indonesia. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan platform Balikin.online.
            </p>
          </section>

          {/* TL;DR */}
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center gap-2">
              <span className="text-3xl">🛡️</span>
              Komitmen Privasi Kami (TL;DR)
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-green-800">Kontak Anda Aman:</strong> Nomor WhatsApp dan email Anda dienkripsi di server kami. Penemu barang tidak akan pernah melihat kontak asli Anda secara terbuka kecuali Anda sendiri yang mengizinkannya.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-green-800">Akses Lokasi Transparan:</strong> Kami hanya merekam koordinat lokasi (GPS) penemu saat mereka memindai (scan) tag Anda secara sukarela, guna membantu Anda mengetahui titik terakhir barang Anda berada.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <strong className="text-green-800">Bebas Spam:</strong> Kami tidak akan pernah menjual, menyewakan, atau menyalahgunakan data pribadi Anda kepada broker data atau jaringan periklanan pihak ketiga.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 1 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Jenis Data Pribadi yang Kami Kumpulkan
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Untuk menghadirkan ekosistem pengembalian barang yang aman, cepat, dan akurat, Balikin.online mengumpulkan jenis informasi berikut:
            </p>

            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">A. Data yang Anda Berikan Secara Langsung (Pemilik Barang)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Informasi Akun:</strong> Nama lengkap, alamat email aktif, dan nomor telepon/WhatsApp yang Anda isi saat melakukan registrasi akun dan aktivasi QR Smart Tag.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Informasi Barang Berharga:</strong> Deskripsi, foto (opsional), dan nama identifikasi barang (seperti "Kunci Mobil", "Dompet Kulit Cokelat", "Laptop Kantor") yang Anda kaitkan dengan sistem QR Smart Tag kami.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">B. Data yang Dikumpulkan secara Otomatis saat Pemindaian (Penemu Barang)</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Data Geolocation (Lokasi GPS):</strong> Koordinat lokasi perkiraan tempat QR Smart Tag dipindai. Data ini hanya diambil jika penemu barang memberikan izin akses lokasi pada peramban (browser) ponsel mereka saat memindai kode QR.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span><strong>Informasi Teknis Perangkat:</strong> Alamat IP (Internet Protocol), jenis peramban web (browser), sistem operasi, serta tanggal dan waktu pemindaian.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Bagaimana Kami Menggunakan Informasi Anda
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Balikin.online hanya menggunakan data pribadi Anda untuk tujuan operasional platform yang sah, antara lain:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Sistem Notifikasi Instan:</strong> Mengirimkan notifikasi darurat melalui WhatsApp atau email ke pemilik barang begitu ada orang yang memindai QR Smart Tag milik Anda.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Peta Pelacakan Pasif:</strong> Menampilkan titik koordinat lokasi pemindaian terakhir di dashboard pribadi pemilik barang untuk mempermudah proses pencarian mandiri.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Pemrosesan Transaksi yang Aman:</strong> Memverifikasi pembayaran paket Premium Lifetime Anda melalui integrasi gerbang pembayaran (payment gateway) resmi yang diawasi oleh Bank Indonesia.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Peningkatan Layanan:</strong> Menganalisis interaksi pengguna untuk mengoptimalkan kecepatan sistem, memperbaiki kendala teknis (bug), dan meningkatkan keamanan platform secara keseluruhan.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Sistem Anonimitas & Keamanan Data WhatsApp
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Kami sangat memahami risiko pembagian nomor telepon pribadi di ruang publik. Oleh karena itu, Balikin.online dirancang dengan pendekatan keamanan Privacy-by-Design:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Enkripsi Data:</strong> Semua nomor WhatsApp yang masuk ke sistem kami dilindungi dengan enkripsi standar industri (Secure Sockets Layer/SSL) baik selama proses pengiriman data maupun saat disimpan di dalam database.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Penghubung Anonim:</strong> Sistem kami membatasi akses penemu barang. Saat penemu memindai tag Anda, mereka hanya akan disajikan tombol interaksi digital (seperti "Hubungi Pemilik via Chat Sistem" atau "Kirim Pesan WA") yang dijembatani langsung oleh server Balikin.online. Nomor WhatsApp asli Anda tetap tersembunyi.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Berbagi Informasi dengan Pihak Ketiga
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Kami tidak pernah menjual, menyewakan, atau menukar data pribadi pengguna kepada pihak luar untuk kebutuhan pemasaran atau periklanan. Kami hanya membagikan informasi dalam batas yang ketat kepada mitra penunjang berikut:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Mitra Payment Gateway:</strong> Informasi transaksi keuangan standar akan dikirimkan secara aman kepada penyelenggara pembayaran berlisensi kami demi menyelesaikan proses transaksi beli tag premium.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Tuntutan Hukum Resmi:</strong> Apabila diwajibkan oleh undang-undang atau perintah pengadilan yang sah dari aparat penegak hukum di Republik Indonesia.</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
              Hak Anda Berdasarkan UU Pelindungan Data Pribadi (UU PDP)
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Sesuai hukum yang berlaku, Anda memiliki kendali penuh atas data pribadi Anda di Balikin.online. Hak-hak tersebut meliputi:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Hak untuk Mengakses & Memperbaiki:</strong> Anda dapat memperbarui informasi nomor WhatsApp, alamat email, atau deskripsi barang kapan saja secara instan melalui dasbor akun Anda.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Hak untuk Menghapus (Right to be Forgotten):</strong> Anda berhak mengajukan permohonan penarikan data atau penghapusan akun secara permanen dari server kami dengan menghubungi pusat bantuan kami.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span><strong>Hak untuk Membatasi Pemrosesan:</strong> Anda dapat menonaktifkan (disable) tag QR tertentu kapan saja di dasbor aplikasi agar tidak dapat dipindai untuk sementara waktu.</span>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
              Penggunaan Cookie dan Pelacakan Web
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Kami menggunakan cookie berukuran kecil di perangkat Anda semata-mata untuk menjaga sesi masuk (login session) tetap aktif dan menyimpan preferensi bahasa Anda. Anda dapat mengatur peramban Anda untuk menolak penggunaan cookie, namun beberapa fitur operasional Balikin.online mungkin tidak dapat berjalan secara maksimal jika opsi ini dinonaktifkan.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">7</span>
              Perubahan Kebijakan Privasi Ini
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-4">
              Untuk memastikan kepatuhan terhadap perkembangan teknologi dan regulasi pemerintah, Balikin.online berhak memperbarui Kebijakan Privasi ini dari waktu ke waktu.
            </p>
            <p className="text-gray-700 leading-relaxed text-justify mb-4">
              Kami akan memberikan pemberitahuan yang jelas (seperti notifikasi di aplikasi atau pengiriman email) minimal 7 (tujuh) hari sebelum ketentuan baru berlaku efektif.
            </p>
            <p className="text-gray-700 leading-relaxed text-justify">
              Kami menyarankan Anda untuk meninjau halaman ini secara berkala agar selalu mendapatkan informasi terbaru mengenai komitmen perlindungan privasi kami.
            </p>
          </section>

          {/* Section 8 - Contact */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm">8</span>
              Hubungi Tim Perlindungan Data Kami
            </h2>
            <p className="text-blue-100 leading-relaxed text-justify mb-6">
              Jika Anda memiliki pertanyaan, keluhan terkait keamanan data, atau ingin mengajukan penghapusan akun dari sistem Balikin.online, silakan hubungi tim dukungan kami yang ramah di:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-blue-200">Email Dukungan</p>
                  <a href="mailto:support@balikin.online" className="text-white font-semibold hover:underline">support@balikin.online</a>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="text-sm text-blue-200">Tautan Kontak Resmi</p>
                  <a href="/contact" className="text-white font-semibold hover:underline">balikin.online/contact</a>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <span className="text-2xl">📸</span>
                <div>
                  <p className="text-sm text-blue-200">Instagram</p>
                  <a href="https://instagram.com/balikin.online" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:underline">@balikin.online</a>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>© 2026 Balikin.online. Hak Cipta Dilindungi.</p>
          </div>
        </main>
      </div>
    </>
  );
}

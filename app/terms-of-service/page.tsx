import type { Metadata } from "next";
import { WebPageJsonLd, OrganizationJsonLd, ContactPointJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan – Balikin.online | Terms of Service Resmi",
  description: "Syarat dan Ketentuan Layanan Balikin.online – Ketentuan penggunaan QR Smart Tag, kebijakan akun premium lifetime, batasan tanggung jawab, dan hak kekayaan intelektual.",
  keywords: [
    "syarat dan ketentuan balikin",
    "terms of service balikin",
    "tos balikin",
    "ketentuan layanan",
    "syarat penggunaan qr tag",
    "kebijakan akun premium",
    "lifetime membership",
    "batasan tanggung jawab",
    "disclaimer balikin",
    "ketentuan hukum",
    "perjanjian pengguna",
    "syarat layanan lost found",
    "kebijakan pengembalian",
    "hak cipta balikin",
    "penutupan akun",
  ],
  openGraph: {
    title: "Syarat dan Ketentuan – Balikin.online | Terms of Service Resmi",
    description: "Syarat dan Ketentuan Layanan Balikin.online – Ketentuan penggunaan QR Smart Tag, kebijakan akun premium lifetime, dan batasan tanggung jawab.",
    type: "website",
  },
  alternates: {
    canonical: "/terms-of-service",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebPageJsonLd
        name="Syarat dan Ketentuan Layanan - Balikin"
        description="Syarat dan Ketentuan Layanan Balikin.online – Ketentuan penggunaan QR Smart Tag, kebijakan akun premium lifetime, batasan tanggung jawab, dan hak kekayaan intelektual."
      />
      <ContactPointJsonLd
        telephone="+6281234567890"
        contactType="Customer Service"
        availableLanguage="Indonesian"
        areaServed="ID"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Syarat dan Ketentuan Layanan</h1>
            <p className="text-xl text-blue-100">Terms of Service – Balikin.online</p>
            <p className="mt-4 text-blue-200 text-sm">Pembaruan Terakhir: Juni 2026</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-justify">
              Selamat datang di Balikin (tersedia melalui situs resmi balikin.online dan aplikasi turunannya). Kami sangat senang bisa membantu Anda mengamankan barang-barang berharga menggunakan teknologi QR Smart Tag.
            </p>
            <p className="text-gray-700 leading-relaxed text-justify mt-4">
              Sebelum Anda mengaktifkan tag fisik atau menggunakan platform digital kami, silakan baca Syarat dan Ketentuan Layanan (ToS) ini dengan saksama. Dengan membuat akun, mendaftarkan tag, atau menggunakan layanan kami, Anda secara otomatis menyetujui seluruh aturan yang tertulis di bawah ini.
            </p>
          </section>

          {/* TL;DR */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">💡</span>
              Ringkasan Cepat (TL;DR) - Versi Manusiawi
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">▸</span>
                <div>
                  <strong className="text-amber-800">Fungsi Utama:</strong> Balikin.online adalah sistem penghubung berbasis kode QR pintar untuk mempertemukan pemilik barang yang hilang dengan penemu barang secara anonim dan aman.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">▸</span>
                <div>
                  <strong className="text-amber-800">Premium Lifetime (Aktif Selamanya):</strong> Cukup bayar sekali, fitur premium Anda akan aktif selama platform Balikin.online beroperasi secara komersial untuk publik.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">▸</span>
                <div>
                  <strong className="text-amber-800">Fleksibilitas Aturan:</strong> Kami dapat memperbarui fitur atau kebijakan demi operasional perusahaan. Namun, kami berjanji akan memberi tahu Anda minimal 7 hari sebelum aturan baru tersebut berlaku efektif.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 text-xl">▸</span>
                <div>
                  <strong className="text-amber-800">Tanggung Jawab:</strong> Kami mengoptimalkan kesempatan barang Anda kembali, namun kami tidak bertanggung jawab atas tindakan fisik di luar platform atau jika barang Anda tetap tidak ditemukan.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 1 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Definisi Layanan Balikin.online
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Balikin.online adalah platform lost and found modern yang menyediakan layanan pelacakan pasif melalui media QR Smart Tag fisik dan sistem informasi digital. Layanan kami mempermudah Penemu Barang (Finder) untuk menghubungi Pemilik Barang (User) secara aman, cepat, dan tanpa harus mengekspos data pribadi yang sensitif secara terbuka.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Pembuatan Akun & Perlindungan Data Pribadi
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">A.</span>
                <div>
                  <strong>Informasi Kontak:</strong> Untuk mengaktifkan sistem notifikasi, Anda wajib memberikan data kontak yang valid (seperti nomor WhatsApp atau email). Data ini digunakan untuk mengirimkan pesan ketika seseorang memindai (scan) tag Anda.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">B.</span>
                <div>
                  <strong>Keamanan Privasi:</strong> Kebijakan utama Balikin.online adalah menjaga privasi Anda. Penemu barang tidak akan bisa melihat nomor WhatsApp atau email asli Anda di halaman publik, kecuali jika Anda sendiri yang memutuskan untuk menampilkannya di profil tag Anda.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1 font-bold">C.</span>
                <div>
                  <strong>Penyalahgunaan Akun:</strong> Anda bertanggung jawab penuh untuk menjaga kerahasiaan akses masuk ke akun Balikin.online Anda.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Ketentuan Akun Premium (Lifetime Membership)
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Bagi pengguna yang membeli paket Premium (Lifetime), berlaku ketentuan hukum sebagai berikut:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Definisi "Aktif Selamanya":</strong> Yang dimaksud dengan "Lifetime" atau "Selamanya" adalah sepanjang masa hidup operasional komersial platform Balikin.online.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Keadaan Kahar (Force Majeure):</strong> Apabila di kemudian hari platform terpaksa berhenti beroperasi karena kondisi darurat, perubahan regulasi hukum pemerintah, bencana teknologi global, atau penutupan bisnis secara komersial, maka kewajiban penyediaan layanan premium ini gugur demi hukum tanpa adanya tuntutan ganti rugi finansial.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              Perubahan Kebijakan dan Fitur Layanan
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify mb-6">
              Sebagai produk teknologi yang terus berkembang, Balikin.online berhak melakukan perubahan aturan, pembaruan fitur, skema harga, atau penyesuaian layanan sewaktu-waktu sesuai dengan keadaan dan kelangsungan operasional perusahaan.
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Pemberitahuan Transparan:</strong> Jika ada perubahan kebijakan yang bersifat signifikan, kami akan mengirimkan pengumuman melalui email terdaftar atau notifikasi di dashboard aplikasi minimal 7 (tujuh) hari sebelum kebijakan baru tersebut berlaku.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Penerimaan Aturan Baru:</strong> Jika Anda tetap menggunakan layanan Balikin.online setelah masa pemberitahuan tersebut berakhir, Anda dianggap menyetujui syarat dan ketentuan yang baru.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
              Batasan Tanggung Jawab (Disclaimer)
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Bukan Jaminan Penemuan:</strong> Balikin.online mengoptimalkan probabilitas pengembalian barang lewat sistem identifikasi visual yang mudah. Namun, kami tidak memberikan jaminan mutlak bahwa barang yang hilang pasti akan ditemukan kembali atau dikembalikan oleh penemu.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Keamanan Pertemuan Fisik:</strong> Proses pengembalian barang secara langsung (offline) adalah tanggung jawab penuh masing-masing individu. Balikin.online tidak bertanggung jawab atas segala bentuk perselisihan, kerugian fisik, materi, atau tindakan kriminal yang terjadi antara Pemilik dan Penemu saat proses COD/pertemuan. Kami sangat menyarankan Anda bertemu di tempat umum yang aman dan ramai.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Kerusakan Tag Fisik:</strong> Kami tidak bertanggung jawab untuk mengganti tag fisik (akrilik/stiker) yang rusak, luntur, atau hilang akibat penggunaan sehari-hari oleh pengguna.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
              Hak Kekayaan Intelektual
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify">
              Seluruh hak cipta, desain visual, sistem QR pintar, merek dagang, kode sumber (source code), dan seluruh konten di dalam situs balikin.online adalah milik sah dari manajemen Balikin. Anda dilarang keras menyalin, memodifikasi, menduplikasi, atau menyalahgunakan hak kekayaan intelektual kami tanpa izin tertulis.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">7</span>
              Penutupan Akun dan Pembatalan Layanan
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Inisiatif Pengguna:</strong> Anda dapat menghapus akun Anda kapan saja melalui sistem pengaturan di dalam aplikasi.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <strong>Pelanggaran Aturan:</strong> Balikin.online berhak membekukan atau menghapus akun pengguna secara sepihak jika ditemukan indikasi penyalahgunaan sistem (seperti tindakan spamming, penipuan, atau penggunaan sistem QR untuk aktivitas ilegal).
                </div>
              </li>
            </ul>
          </section>

          {/* Section 8 - Contact */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm">8</span>
              Hubungi Kami
            </h2>
            <p className="text-blue-100 leading-relaxed text-justify mb-6">
              Jika Anda memiliki pertanyaan seputar dokumen hukum ini, silakan hubungi tim kami yang ramah melalui:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-sm text-blue-200">Email Resmi</p>
                  <a href="mailto:support@balikin.online" className="text-white font-semibold hover:underline">support@balikin.online</a>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-sm text-blue-200">Layanan WhatsApp</p>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:underline">+62 812-3456-7890</a>
                </div>
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Legal & Kepatuhan Regulasi Indonesia</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Syarat dan Ketentuan Layanan Balikin.online disusun sesuai dengan ketentuan hukum yang berlaku di Indonesia, termasuk namun tidak terbatas pada Undang-Undang Informasi dan Transaksi Elektronik (UU ITE), Undang-Undang Perlindungan Data Pribadi (UU PDP), dan regulasi perdagangan elektronik. Dokumen ini mengatur hubungan hukum antara pengguna dan platform Balikin dalam penggunaan layanan QR Smart Tag untuk perlindungan barang berharga. Setiap pengguna disarankan untuk membaca dan memahami ketentuan ini sebelum menggunakan layanan kami.
            </p>
          </section>

          {/* Footer Note */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>© 2026 Balikin.online. Syarat dan Ketentuan Layanan dapat berubah sewaktu-waktu.</p>
          </div>
        </main>
      </div>
    </>
  );
}

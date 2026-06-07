import type { Metadata } from "next";
import { WebPageJsonLd, FAQPageJsonLd, OrganizationJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "FAQ Balikin.online | Pertanyaan Umum Seputar QR Smart Tag & Lost Found",
  description: "Temukan jawaban FAQ Balikin tentang cara kerja QR Smart Tag, keamanan privasi, harga premium lifetime, pengiriman, garansi, dan solusi kehilangan barang di Indonesia.",
  keywords: [
    "faq balikin",
    "pertanyaan umum balikin",
    "cara kerja qr tag",
    "bagaimana cara menggunakan balikin",
    "apakah balikin aman",
    "privasi whatsapp balikin",
    "harga balikin",
    "premium lifetime balikin",
    "berapa harga qr tag",
    "pengiriman balikin",
    "garansi stiker qr",
    "barang hilang bagaimana",
    "penemu barang",
    "syarat menggunakan balikin",
    "pertanyaan seputar lost found",
  ],
  openGraph: {
    title: "FAQ Balikin.online | Pertanyaan Umum Seputar QR Smart Tag",
    description: "Jawaban lengkap untuk pertanyaan seputar Balikin, cara kerja QR Smart Tag, privasi, harga, dan layanan pelanggan.",
    type: "website",
  },
  alternates: {
    canonical: "/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const faqItems = [
  {
    question: "Apa itu Balikin.online dan bagaimana cara kerjanya?",
    answer: "Balikin.online adalah platform smart lost & found Indonesia yang menggunakan teknologi QR Smart Tag. Cara kerjanya: Anda menempelkan stiker atau gantungan kunci QR pada barang berharga Anda. Jika barang tersebut hilang dan ditemukan oleh orang lain, penemu cukup memindai kode QR tersebut untuk menghubungi Anda secara anon melalui sistem kami. Data pribadi Anda tetap aman dan terlindungi.",
  },
  {
    question: "Apakah nomor WhatsApp saya aman? Apakah akan ditampilkan ke publik?",
    answer: "Ya, nomor WhatsApp Anda 100% aman. Balikin menggunakan sistem privasi-by-design dimana nomor WhatsApp asli Anda tidak pernah ditampilkan di halaman publik. Penemu barang hanya melihat tombol 'Hubungi Pemilik' yang dijembatani melalui server kami. Nomor Anda hanya dibagikan jika Anda sendiri yang memberikannya secara langsung kepada penemu.",
  },
  {
    question: "Apa yang dimaksud dengan Premium Lifetime? Apakah benar-benar selamanya?",
    answer: "Premium Lifetime berarti Anda hanya membayar sekali saat membeli tag fisik, dan fitur premium akan aktif selamanya selama platform Balikin.online beroperasi secara komersial. Tidak ada biaya bulanan atau tahunan. Namun, jika suatu saat platform harus tutup karena force majeure, kewajiban layanan akan gugur secara hukum tanpa klaim ganti rugi.",
  },
  {
    question: "Berapa harga QR Smart Tag Balikin?",
    answer: "Harga varian tergantung jenis produk fisik yang Anda pilih: Stiker QR Premium mulai dari RpXX.000, Gantungan Kunci Akrilik mulai dari RpXX.000, dan paket bundling lebih hemat. Semua produk sudah termasuk akses premium lifetime. Silakan cek halaman produk atau hubungi WhatsApp kami untuk harga terbaru.",
  },
  {
    question: "Apa yang terjadi jika barang saya hilang dan ditemukan orang lain?",
    answer: "Ketika barang Anda ditemukan dan QR code-nya dipindai, Anda akan menerima notifikasi instan melalui WhatsApp dan email berisi informasi perkiraan lokasi penemuan (jika penemu mengizinkan akses lokasi). Anda kemudian dapat memutuskan langkah selanjutnya: berkomunikasi dengan penemu melalui sistem chat, atau mengatur pertemuan untuk pengembalian barang.",
  },
  {
    question: "Apakah penemu barang perlu mengunduh aplikasi?",
    answer: "Tidak perlu. Sistem Balikin dirancang untuk tanpa aplikasi (app-free). Penemu cukup menggunakan kamera ponsel bawaan untuk memindai QR code, dan akan diarahkan ke halaman web responsif yang dapat diakses langsung melalui browser. Ini memudahkan siapa saja untuk melaporkan barang yang mereka temukan.",
  },
  {
    question: "Bagaimana dengan barang yang tidak kembali? Apakah ada jaminan?",
    answer: "Balikin.online memaksimalkan peluang pengembalian barang dengan menyediakan sarana komunikasi yang mudah antara penemu dan pemilik. Namun, kami tidak dapat menjamin bahwa barang yang hilang pasti akan ditemukan atau dikembalikan, karena hal tersebut bergantung pada berbagai faktor eksternal termasuk kejujuran penemu dan kondisi barang.",
  },
  {
    question: "Apakah stiker QR tahan air dan cuaca?",
    answer: "Stiker QR Premium Balikin menggunakan material vinil waterproof dengan laminasi pelindung, dirancang untuk tahan air, sinar UV, dan penggunaan sehari-hari. Untuk penggunaan outdoor yang ekstrem, kami merekomendasikan varian gantungan kunci akrilik yang lebih durable dan tahan lama.",
  },
  {
    question: "Berapa lama pengiriman produk ke seluruh Indonesia?",
    answer: "Kami melayani pengiriman ke seluruh Indonesia dengan estimasi: Jabodetabek 2-3 hari kerja, Jawa & Bali 3-5 hari kerja, Sumatera, Kalimantan, Sulawesi 4-7 hari kerja, Papua & Maluku 7-14 hari kerja. Pengiriman menggunakan ekspedisi terpercaya (JNE, J&T, Sicepat) dengan resi yang dapat dilacak.",
  },
  {
    question: "Apakah ada garansi jika QR code tidak bisa dipindai?",
    answer: "Ya, kami memberikan garansi kualitas produk. Jika QR code pada tag fisik mengalami kerusakan produksi yang menyebabkan tidak bisa dipindai dalam masa garansi, kami akan menggantinya dengan yang baru. Garansi tidak berlaku untuk kerusakan akibat penggunaan yang tidak wajar, kecelakaan, atau kelalaian pengguna.",
  },
  {
    question: "Bisakah saya mengubah informasi kontak setelah tag terdaftar?",
    answer: "Ya, salah satu keunggulan Balikin adalah fleksibilitas data. Anda dapat mengubah nomor WhatsApp, email, foto profil, dan informasi barang kapan saja melalui dashboard akun Anda tanpa perlu mengganti QR code fisik. Ini sangat berguna jika Anda ganti nomor atau menjual barang kepada orang lain.",
  },
  {
    question: "Apakah Balikin hanya untuk barang tertentu atau bisa untuk apa saja?",
    answer: "Balikin dapat digunakan untuk berbagai jenis barang: kunci kendaraan (mobil, motor), dompet, laptop, tas, passport, kartu identitas, hingga hewan peliharaan. Kami juga menyediakan modul khusus untuk kebutuhan spesifik seperti Student Kit (untuk pelajar), Otomotif (untuk kendaraan), dan ID Card peliharaan.",
  },
  {
    question: "Bagaimana jika saya lupa password akun Balikin?",
    answer: "Anda dapat menggunakan fitur 'Lupa Password' di halaman login. Kami akan mengirimkan link reset password ke email terdaftar Anda. Jika email juga tidak dapat diakses, silakan hubungi customer service kami dengan bukti kepemilikan tag (nomor seri tag) untuk bantuan pemulihan akun.",
  },
  {
    question: "Apakah data saya aman dan tidak akan dijual ke pihak ketiga?",
    answer: "Kami berjanji tidak akan pernah menjual, menyewakan, atau menyalahgunakan data pribadi Anda kepada broker data atau pihak ketiga untuk tujuan periklanan. Seluruh data pengguna dilindungi dengan enkripsi standar industri dan diurus sesuai dengan Kebijakan Privasi kami yang mematuhi UU PDP Indonesia.",
  },
  {
    question: "Bagaimana cara menghapus akun dan data saya dari sistem?",
    answer: "Anda dapat menghapus akun kapan saja melalui menu Pengaturan di dashboard akun. Proses ini akan menghapus data pribadi Anda dari sistem aktif kami. Untuk permintaan penghapusan data permanen (right to be forgotten) sesuai UU PDP, silakan hubungi support@balikin.online dengan subject 'Permohonan Hapus Data'.",
  },
];

export default function FAQPage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebPageJsonLd
        name="FAQ Balikin - Pertanyaan Umum Seputar QR Smart Tag & Lost Found"
        description="Temukan jawaban FAQ Balikin tentang cara kerja QR Smart Tag, keamanan privasi, harga premium lifetime, pengiriman, garansi, dan solusi kehilangan barang."
      />
      <FAQPageJsonLd questions={faqItems} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FAQ Balikin.online</h1>
            <p className="text-xl text-blue-100">Pertanyaan yang Sering Diajukan</p>
            <p className="mt-4 text-blue-200 text-sm">Jawaban lengkap seputar QR Smart Tag & Layanan Lost Found</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-justify">
              Temukan jawaban untuk pertanyaan-pertanyaan umum seputar Balikin.online, cara kerja teknologi QR Smart Tag, keamanan privasi, harga, dan layanan pelanggan. Jika Anda tidak menemukan jawaban yang Anda cari, silakan hubungi tim support kami.
            </p>
          </section>

          {/* FAQ Items */}
          <section className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-slate-50 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{item.question}</h3>
                    <span className="text-blue-600 group-open:rotate-180 transition-transform duration-200">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-gray-700 leading-relaxed text-justify">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Masih Punya Pertanyaan?</h2>
            <p className="text-blue-100 text-center mb-6">
              Tim support kami siap membantu menjawab pertanyaan Anda yang belum tercantum di FAQ ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
              >
                Hubungi Kami
              </a>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center"
              >
                Chat WhatsApp
              </a>
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Solusi Anti Kehilangan Terpercaya di Indonesia</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Balikin.online hadir sebagai solusi smart lost and found pertama di Indonesia yang menggabungkan teknologi QR code dengan sistem pelacakan pasif. Platform kami telah membantu ribuan pengguna di seluruh Indonesia—mulai dari Jakarta, Bandung, Surabaya, hingga kota-kota besar lainnya—untuk melindungi barang berharga mereka. Dengan sistem privasi yang aman, premium lifetime tanpa biaya berlangganan, dan dukungan pelanggan yang responsif, Balikin menjadi pilihan terbaik untuk keamanan barang Anda.
            </p>
          </section>

          {/* Footer Note */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>© 2026 Balikin.online. FAQ diperbarui secara berkala.</p>
          </div>
        </main>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { WebPageJsonLd, FAQPageJsonLd, OrganizationJsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import {
  PRINTABLE_FIVE_PRICE,
  PRINTABLE_SINGLE_PRICE,
  PRINTABLE_TEN_PRICE,
} from "@/lib/constants";
import { PRODUCT_CATALOG } from "@/lib/product-catalog";

const formatPrice = (price: number) => `Rp${price.toLocaleString("id-ID")}`;
const productPriceSummary = [
  `Printable Single ${formatPrice(PRINTABLE_SINGLE_PRICE)}`,
  `Printable 5 Tag ${formatPrice(PRINTABLE_FIVE_PRICE)}`,
  `Printable 10 Tag ${formatPrice(PRINTABLE_TEN_PRICE)}`,
  ...Object.values(PRODUCT_CATALOG).map(
    (product) => `${product.name} ${formatPrice(product.price)}`,
  ),
].join(", ");

export const metadata: Metadata = {
  title: "FAQ Balikin.online | Pertanyaan Umum Seputar QR Smart Tag & Lost Found",
  description: "Temukan jawaban FAQ Balikin tentang cara kerja QR Smart Tag, privasi, pilihan harga, kontak, dan batasan layanan lost & found.",
  keywords: [
    "faq balikin",
    "pertanyaan umum balikin",
    "cara kerja qr tag",
    "bagaimana cara menggunakan balikin",
    "apakah balikin aman",
    "privasi whatsapp balikin",
    "harga balikin",
    "berapa harga qr tag",
    "pengiriman balikin",
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
    answer: "Balikin.online adalah platform smart lost & found Indonesia yang menggunakan teknologi QR Smart Tag. Anda menempelkan stiker atau gantungan kunci QR pada barang; saat kode dipindai, penemu dapat membuka halaman publik tag dan menggunakan jalur kontak yang tersedia tanpa nomor WhatsApp dicetak pada tag.",
  },
  {
    question: "Apakah nomor WhatsApp saya aman? Apakah akan ditampilkan ke publik?",
    answer: "Balikin tidak mencetak nomor WhatsApp pada tag. Halaman publik mengarahkan penemu melalui tombol kontak yang tersedia, sehingga nomor tidak perlu ditampilkan sebagai teks terbuka pada barang.",
  },
  {
    question: "Apa saja pilihan harga Balikin?",
    answer: `Harga yang tercantum saat ini: ${productPriceSummary}. Tag digital gratis memiliki batas maksimal 1 tag. Periksa halaman Harga untuk informasi terbaru karena harga dan ketersediaan dapat berubah.`,
  },
  {
    question: "Berapa harga QR Smart Tag Balikin?",
    answer: `Harga bergantung pada varian yang dipilih. Katalog saat ini mencantumkan ${productPriceSummary}. Lihat halaman Harga dan Produk untuk detail paket, isi, dan ketersediaan terbaru.`,
  },
  {
    question: "Apa yang terjadi jika barang saya hilang dan ditemukan orang lain?",
    answer: "Saat QR code dipindai, penemu dapat melihat halaman publik tag dan jalur kontak yang tersedia. Scan dapat dicatat bersama waktu dan perkiraan lokasi jika fitur terkait tersedia dan diizinkan; Balikin tidak menjamin setiap scan menghasilkan lokasi yang akurat atau barang kembali.",
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
    answer: "Spesifikasi material bergantung pada varian produk. Periksa halaman Produk untuk detail terbaru sebelum membeli atau hubungi Balikin jika membutuhkan rekomendasi penggunaan.",
  },
  {
    question: "Berapa lama pengiriman produk ke seluruh Indonesia?",
    answer: "Ketersediaan pengiriman, biaya, dan estimasi waktu bergantung pada produk serta alamat tujuan. Hubungi Balikin melalui halaman Kontak untuk informasi pengiriman terbaru sebelum memesan.",
  },
  {
    question: "Apakah ada garansi jika QR code tidak bisa dipindai?",
    answer: "Untuk pertanyaan tentang kualitas produk, kerusakan, atau kebijakan penggantian, hubungi Balikin melalui halaman Kontak dengan menyertakan detail order dan masalah yang terjadi. Ketentuan dapat berbeda menurut produk dan order.",
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
    answer: "Jenis data, tujuan penggunaan, dan langkah perlindungan dijelaskan dalam Kebijakan Privasi Balikin. Tidak ada sistem yang bebas risiko 100%, jadi pengguna sebaiknya tidak memasukkan data sensitif yang tidak diperlukan untuk layanan.",
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
        path="/faq"
        name="FAQ Balikin - Pertanyaan Umum Seputar QR Smart Tag & Lost Found"
        description="Temukan jawaban FAQ Balikin tentang cara kerja QR Smart Tag, privasi, pilihan harga, dan batasan layanan."
      />
      <FAQPageJsonLd questions={faqItems} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <SiteHeader />
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
                href="/contact"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center"
              >
                Kontak dan WhatsApp
              </a>
            </div>
          </section>

          {/* SEO Content */}
          <section className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Solusi Anti Kehilangan Terpercaya di Indonesia</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Balikin.online menggabungkan QR code dengan halaman tag digital untuk membantu pemilik dan penemu berkomunikasi ketika barang hilang. Platform ini dapat digunakan untuk berbagai barang pribadi; baca Cara Kerja, Harga, dan Kebijakan Privasi untuk detail layanan, biaya, serta batasannya.
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

import type { Metadata } from "next";
import { WebPageJsonLd, ContactPointJsonLd, OrganizationJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Hubungi Kami – Balikin.online | Kontak & Customer Service Resmi",
  description: "Hubungi Balikin.online untuk pemesanan QR Smart Tag, pertanyaan produk, kerja sama komunitas, sekolah, corporate, atau bantuan teknis. Customer service responsif via WhatsApp & Email.",
  keywords: [
    "kontak balikin",
    "hubungi balikin",
    "customer service balikin",
    "cs balikin",
    "pesan gantungan kunci qr code",
    "beli stiker qr",
    "kerja sama balikin",
    "partnership balikin",
    "alamat balikin",
    "kantor balikin",
    "whatsapp balikin",
    "email balikin",
    "support balikin",
    "bantuan teknis",
    "komplain balikin",
  ],
  openGraph: {
    title: "Hubungi Kami – Balikin.online | Kontak & Customer Service",
    description: "Hubungi Balikin untuk pemesanan QR Smart Tag, pertanyaan produk, kerja sama, atau bantuan teknis.",
    type: "website",
  },
  alternates: {
    canonical: "/contact",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebPageJsonLd
        name="Hubungi Kami - Balikin"
        description="Hubungi Balikin.online untuk pemesanan QR Smart Tag, pertanyaan produk, kerja sama komunitas, sekolah, corporate, atau bantuan teknis."
      />
      <ContactPointJsonLd
        telephone="+6287883956811"
        contactType="Customer Service"
        availableLanguage="Indonesian"
        areaServed="ID"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Hero Section */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Hubungi Kami</h1>
            <p className="text-xl text-blue-100">Kami Siap Membantu Anda</p>
            <p className="mt-4 text-blue-200 text-sm">Tim Customer Service Balikin.online siap menjawab pertanyaan Anda</p>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-justify">
              Butuh bantuan seputar produk Balikin, ingin memesan QR Smart Tag, atau punya pertanyaan teknis? Tim kami siap membantu Anda dengan respon cepat dan ramah. Silakan pilih saluran komunikasi yang paling nyaman untuk Anda.
            </p>
          </section>

          {/* Contact Channels */}
          <section className="grid md:grid-cols-2 gap-6 mb-8">
            {/* WhatsApp */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">WhatsApp</h3>
              </div>
              <p className="text-gray-600 mb-4">Respon tercepat untuk pemesanan dan pertanyaan umum</p>
              <a
                href="https://wa.me/6287883956811?text=Halo%20Balikin,%20saya%20ingin%20bertanya%20seputar%20QR%20Smart%20Tag"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Chat WhatsApp</span>
              </a>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Email</h3>
              </div>
              <p className="text-gray-600 mb-4">Untuk pertanyaan detail, partnership, atau dukungan teknis</p>
              <a
                href="mailto:support@balikin.online"
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                <span>support@balikin.online</span>
              </a>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Instagram</h3>
              </div>
              <p className="text-gray-600 mb-4">Update terbaru, tips, dan konten edukatif</p>
              <a
                href="https://instagram.com/balikin.online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium"
              >
                <span>@balikin.online</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Website */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Website Resmi</h3>
              </div>
              <p className="text-gray-600 mb-4">Informasi lengkap produk dan layanan</p>
              <a
                href="https://balikin.online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
              >
                <span>balikin.online</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>

          {/* Contact Reasons */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Alasan Menghubungi Kami</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pemesanan Produk</h3>
                  <p className="text-gray-600 text-sm">QR Smart Tag, stiker, gantungan kunci</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pertanyaan Umum</h3>
                  <p className="text-gray-600 text-sm">FAQ, cara kerja, fitur produk</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kerja Sama & Partnership</h3>
                  <p className="text-gray-600 text-sm">Komunitas, sekolah, corporate</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bantuan Teknis</h3>
                  <p className="text-gray-600 text-sm">Kendala akun, scan QR, notifikasi</p>
                </div>
              </div>
            </div>
          </section>

          {/* Business Hours */}
          <section className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Jam Operasional</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp & Email Support</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Senin - Jumat: 08:00 - 20:00 WIB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span>Sabtu: 09:00 - 17:00 WIB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Minggu & Hari Libur: Tutup</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Estimasi Respon</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• WhatsApp: &lt; 1 jam (jam kerja)</li>
                  <li>• Email: &lt; 24 jam</li>
                  <li>• Instagram DM: &lt; 4 jam</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Partnership CTA */}
          <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Tertarik untuk Kerja Sama?</h2>
            <p className="text-gray-700 mb-4">
              Kami terbuka untuk kolaborasi dengan komunitas, sekolah, universitas, corporate, dan organisasi lainnya untuk program perlindungan barang massal. Hubungi kami untuk penawaran khusus volume.
            </p>
            <a
              href="mailto:partnership@balikin.online"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <span>Discuss Partnership</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </section>

          {/* SEO Content */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Layanan Pelanggan Balikin.online</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Balikin.online menyediakan layanan pelanggan responsif untuk seluruh Indonesia. Tim customer service kami siap membantu pemesanan QR Smart Tag, pertanyaan teknis, konsultasi kebutuhan perlindungan barang, serta penanganan kendala penggunaan platform. Kami berkomitmen memberikan pengalaman pelanggan terbaik dengan respon cepat melalui WhatsApp, email, dan media sosial. Untuk kebutuhan corporate partnership atau volume besar, silakan hubungi kami secara langsung untuk penawaran khusus.
            </p>
          </section>

          {/* Location Note */}
          <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lokasi Operasional</h2>
            <p className="text-gray-700 leading-relaxed text-justify text-sm">
              Balikin.online beroperasi secara online dengan pengiriman ke seluruh Indonesia. Kantor dan gudang kami terletak di area Jabodetabek untuk memastikan pengiriman yang cepat dan efisien ke seluruh pelosok negeri. Produk kami dikirim menggunakan ekspedisi terpercaya seperti JNE, J&T Express, dan Sicepat dengan tracking real-time.
            </p>
          </section>

          {/* Footer Note */}
          <div className="text-center text-gray-500 text-sm py-8">
            <p>© 2026 Balikin.online. Tim Customer Service siap melayani Anda.</p>
          </div>
        </main>
      </div>
    </>
  );
}

import type { Metadata } from 'next';
import { CampaignForm } from '@/components/campaign-form';
import Image from 'next/image';
import {
  Shield,
  Zap,
  Lock,
  MessageSquare,
  MapPin,
  Gift,
  CheckCircle2,
  Trophy,
  Smartphone,
  Users
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Balikin Smart Tag - Lisensi Sistem Pelacakan Barang Hilang Terpercaya',
  description:
    'Lindungi barang berharga Anda dengan lisensi Balikin Smart Tag. Teknologi QR code + gantungan akrilik untuk tracking barang hilang real-time. Daftar sekarang & dapatkan akses eksklusif!',
  openGraph: {
    title: 'Balikin Smart Tag - Sistem Pelacakan Barang Hilang',
    description:
      'Lindungi barang berharga Anda dengan lisensi Balikin Smart Tag. QR code + tracking real-time + privasi terjaga.',
    type: 'website',
  },
};

const acrilicShapes = [
  { name: 'Oval', icon: '◯' },
  { name: 'Persegi Panjang', icon: '▭' },
  { name: 'Persegi Panjang Timbul', icon: '▮' },
  { name: 'Persegi Panjang Motif', icon: '◰' },
  { name: 'Hati', icon: '♡' },
  { name: 'Kotak', icon: '□' },
  { name: 'Lingkaran', icon: '●' },
  { name: 'Persegi 8', icon: '⬡' },
];

export default function FirstLaunchPage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-8">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            🎉 First Launch Campaign
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
                Barang Hilang
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Kembali Lagi
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-light">
                Dapatkan akses lisensi <strong>Balikin Smart Tag</strong> — sistem pelacakan barang hilang paling canggih di Indonesia. Teknologi QR code + gantungan akrilik elegan memastikan barang berharga Anda selalu dapat ditemukan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">Lisensi Resmi Balikin</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">8 Desain Akrilik Eksklusif</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <strong>Bonus Early Bird:</strong> 50% diskon untuk 100 pendaftar pertama!
                </p>
              </div>
            </div>

            {/* Right - Gallery Preview */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center overflow-hidden">
                <Image
                  src="/gallery/Balikin Online Qr gantungan kunci temukan barang hilang (1).webp"
                  alt="Balikin Smart Tag Preview"
                  width={400}
                  height={400}
                  className="object-contain p-8"
                  priority
                />
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                Lihat 8 desain akrilik eksklusif di bawah
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl p-8 md:p-12 text-center border border-blue-300 dark:border-blue-800">
            <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-blue-50 mb-4">
              Jadilah Early Adopter Balikin
            </h2>
            <p className="text-blue-100 dark:text-blue-200 mb-8 text-lg">
              Daftar sekarang dan dapatkan akses eksklusif ke lisensi Balikin Smart Tag.
              Kami akan menghubungi Anda dengan penawaran khusus segera!
            </p>
            <div className="max-w-md mx-auto">
              <CampaignForm
                campaignName="first-launch"
                campaignTitle="Balikin First Launch - Smart Tag License"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Acrylic Shapes Gallery */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              8 Desain Akrilik Eksklusif
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Pilih bentuk yang paling sesuai dengan gaya pribadi Anda
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {acrilicShapes.map((shape, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-slate-800 rounded-xl p-8 text-center hover:shadow-lg dark:hover:shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {shape.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {shape.name}
                </h3>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-slate-700 dark:text-slate-300 text-center">
              Setiap desain akrilik dapat dikustomisasi dengan nama, foto, atau logo perusahaan Anda.
              <br className="hidden md:block" />
              <strong>Tambahan biaya desain custom tersedia dengan harga spesial untuk early adopters.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16 text-center">
            Cara Kerja Balikin Smart Tag
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 text-center">
                Pasang Akrilik
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center text-sm leading-relaxed">
                Pasang gantungan akrilik Balikin pada barang berharga Anda (kunci, tas, dll)
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-blue-600 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 text-center">
                Scan QR Code
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center text-sm leading-relaxed">
                Jika barang hilang, penemu cukup scan QR code dengan smartphone mereka
              </p>
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-indigo-600 to-transparent"></div>
            </div>

            <div className="relative">
              <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 text-center">
                Hubungi Anda
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center text-sm leading-relaxed">
                Penemu bisa langsung menghubungi Anda via WhatsApp (nomor Anda aman, tersembunyi)
              </p>
              <div className="hidden md:block absolute top-8 -right-4 w-8 h-1 bg-gradient-to-r from-purple-600 to-transparent"></div>
            </div>

            <div>
              <div className="bg-pink-600 text:white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                ✓
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3 text-center">
                Barang Kembali
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center text-sm leading-relaxed">
                Barang hilang Anda kembali dengan aman, tanpa pembocoran data pribadi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16 text-center">
            Mengapa Pilih Balikin?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-blue-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Privasi Terjamin
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Nomor WhatsApp Anda tidak akan pernah terlihat oleh penemu. Sistem relay kami menjaga privasi sepenuhnya dengan teknologi enkripsi tingkat enterprise.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-indigo-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Instan & Mudah
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tidak perlu registrasi, login, atau dokumentasi rumit. Scan QR code, kirim pesan — selesai. Dirancang untuk kesederhanaan maksimal.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-purple-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Aman & Terpercaya
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Teknologi QR code yang tidak bisa di-clone atau ditipu. Database terenkripsi dengan standar keamanan banking-grade di Supabase.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-green-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Tracking Real-Time
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Dapatkan notifikasi real-time saat barang Anda dipindai. Lihat lokasi penemu dengan presisi tinggi untuk koordinasi pengembalian.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-orange-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
                <Gift className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Desain Stylish
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Gantungan akrilik berkualitas premium dengan 8 pilihan desain. Tidak hanya fungsional, tapi juga mempercantik barang Anda.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-cyan-900/30 transition-shadow">
              <div className="w-14 h-14 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">
                Komunitas Aktif
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Bergabung dengan ribuan pengguna di seluruh Indonesia. Semakin banyak pengguna = semakin besar kemungkinan barang ditemukan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16 text-center">
            Cocok untuk Siapa Saja
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  Untuk Anak-Anak & Pelajar
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Pasang pada tas, botol minum, atau gadget anak. Orang tua akan tenang tahu barang penting anak aman jika hilang.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  Untuk Pengusaha & Profesional
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Amankan laptop bag, kamera, atau gadget profesional Anda. Balikin memberikan peace of mind saat traveling.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  Untuk Kolektor & Hobby Enthusiast
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Proteksi barang koleksi berharga Anda. Dari sepeda, motor, hingga barang antik — semua bisa dilindungi.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <Gift className="w-8 h-8 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  Untuk Perusahaan & Korporat
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Branding giveaway terbaik untuk klien. Kombinasikan dengan logo perusahaan di akrilik untuk sentuhan profesional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16 text-center">
            Pertanyaan Umum
          </h2>

          <div className="space-y-6">
            <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white select-none">
                <span>Apakah Lisensi Balikin itu produk fisik atau digital?</span>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Lisensi Balikin adalah akses ke ekosistem digital lengkap + gantungan akrilik fisik berkualitas premium. Anda mendapatkan akses ke platform Smart Tag kami + pengiriman akrilik pilihan ke alamat Anda.
              </p>
            </details>

            <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white select-none">
                <span>Berapa biaya lisensi Balikin?</span>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Harga spesial akan kami berikan kepada 100 early supporters pertama dengan diskon hingga 50%. Biaya reguler akan kami jelaskan langsung setelah Anda mendaftar.
              </p>
            </details>

            <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white select-none">
                <span>Apakah data saya aman di Balikin?</span>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Ya, 100% aman. Database kami hosted di Supabase dengan enkripsi tingkat banking. Nomor WhatsApp Anda tidak pernah ditampilkan kepada penemu — hanya sistem relay kami yang tahu identitas asli Anda.
              </p>
            </details>

            <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white select-none">
                <span>Berapa lama proses pengiriman akrilik?</span>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Pengiriman standar 3-7 hari kerja tergantung lokasi. Untuk early supporters kami juga menyediakan express shipping dengan upgrade yang sangat terjangkau.
              </p>
            </details>

            <details className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 cursor-pointer">
              <summary className="flex items-center justify-between font-bold text-slate-900 dark:text-white select-none">
                <span>Bisa custom desain akrilik dengan logo atau nama saya?</span>
                <span className="text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
                Tentu! Custom design tersedia dengan biaya tambahan yang spesial untuk early supporters. Hubungi tim kami setelah Anda mendaftar untuk konsultasi desain gratis.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
            Jangan Sampai Kehabisan Kuota Early Bird
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
            Hanya 100 slot pertama yang mendapatkan diskon 50% + bonus eksklusif. Daftar sekarang dan amankan posisi Anda!
          </p>
          <div className="max-w-md mx-auto">
            <CampaignForm
              campaignName="first-launch"
              campaignTitle="Balikin First Launch - Smart Tag License"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Balikin</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sistem Smart Lost and Found terpercaya di Indonesia
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Produk</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Lisensi Smart Tag</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Gantungan Akrilik</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Paket Korporat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Hubungi Kami</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 dark:hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>&copy; 2024 Balikin. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

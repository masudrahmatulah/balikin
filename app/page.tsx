'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  QrCode,
  Shield,
  Smartphone,
  MapPin,
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Gift,
  Clock,
  Lock,
} from 'lucide-react';
import { useState } from 'react';

// FAQ Data
const faqs = [
  {
    question: 'Apa itu Balikin?',
    answer: 'Balikin adalah platform Smart Lost & Found yang menggunakan QR code untuk menghubungkan barang fisik dengan identitas digital. Jika barang Anda hilang dan ditemukan orang lain, mereka bisa scan QR code dan menghubungi Anda tanpa melihat privasi Anda.',
  },
  {
    question: 'Bagaimana cara kerjanya?',
    answer: '1) Daftar dan buat tag untuk barang Anda. 2) Download dan tempel QR code pada barang. 3) Jika barang hilang, ubah status ke "Hilang". 4) Penemu yang scan QR akan melihat info kontak Anda dan bisa menghubungi via WhatsApp.',
  },
  {
    question: 'Apakah identitas saya aman?',
    answer: 'Ya! Identitas Anda (nama, nomor HP) tidak ditampilkan pada benda fisik. Hanya QR code yang terlihat. Nomor WhatsApp hanya muncul di halaman setelah scan, dan penemu menghubungi Anda tanpa melihat nomor asli.',
  },
  {
    question: 'Berapa biaya menggunakan Balikin?',
    answer: 'Untuk saat ini, Balikin gratis digunakan. Anda bisa membuat unlimited tag untuk melindungi barang-barang Anda. Kami mungkin menambahkan fitur premium di masa depan.',
  },
  {
    question: 'Apakah perlu install aplikasi?',
    answer: 'Tidak perlu! Balikin berbasis web, bisa diakses dari browser manapun. Untuk menemukan QR code, penemu cukup pakai kamera HP atau aplikasi QR scanner bawaan.',
  },
  {
    question: 'Bagaimana jika saya ganti nomor WhatsApp?',
    answer: 'Anda bisa mengupdate nomor WhatsApp kapan saja lewat dashboard. Tidak perlu ganti QR code fisik karena data tersimpan secara dinamis di database.',
  },
  {
    question: 'Apa yang terjadi jika barang saya hilang?',
    answer: 'Ubah status tag ke "Hilang" di dashboard. Halaman publik akan berubah tampilan merah darurat dengan info imbalan (jika ada). Setiap scan akan dilacak lokasinya dan bisa Anda lihat di dashboard.',
  },
  {
    question: 'Apakah ada batas jumlah tag?',
    answer: 'Tidak ada batas! Anda bisa membuat tag sebanyak yang Anda butuhkan untuk semua barang berharga Anda.',
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 px-2 rounded"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 px-2 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}

function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Pertanyaan yang Sering Diajukan</h2>
        <Card>
          <CardContent className="p-0">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Balikin</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Smart Lost & Found Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Temukan Kembali Barang Hilang Anda dengan Mudah
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital.
            Cukup scan QR code, hubungi pemilik, dan barang kembali!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg" asChild>
              <Link href="#cara-kerja">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Cara Kerja */}
      <section id="cara-kerja" className="container mx-auto px-4 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-4">Cara Kerja Balikin</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Hanya dengan 3 langkah sederhana, barang berharga Anda akan terlindungi
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardContent className="pt-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4 mt-2">
                <QrCode className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Buat & Pasang QR Tag</h3>
              <p className="text-gray-600">
                Daftar, buat tag untuk barang Anda, download QR code, lalu tempel pada kunci, tas, atau dompet.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardContent className="pt-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 mt-2">
                <Smartphone className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
              <p className="text-gray-600">
                Jika barang hilang dan ditemukan orang lain, mereka tinggal scan QR code dengan kamera HP.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardContent className="pt-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4 mt-2">
                <MessageCircle className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Hubungi Pemilik</h3>
              <p className="text-gray-600">
                Penemu langsung bisa hubungi Anda via WhatsApp tanpa perlu tahu identitas pribadi Anda.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kenapa Memilih Balikin?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Lock className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Privasi Terjaga</h3>
              <p className="text-blue-100 text-sm">
                Identitas Anda tidak ditampilkan di benda fisik, hanya QR code yang terlihat.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <MapPin className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Lacak Lokasi</h3>
              <p className="text-blue-100 text-sm">
                Riwayat scan menampilkan lokasi terakhir barang saat di-scan.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Clock className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Update Real-time</h3>
              <p className="text-blue-100 text-sm">
                Ubah data kontak atau status barang kapan saja tanpa ganti QR code.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <Gift className="h-10 w-10 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Mode Hilang</h3>
              <p className="text-blue-100 text-sm">
                Aktifkan mode hilang untuk tampilan darurat dengan info imbalan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Harga Terjangkau untuk Ketenangan Hati</h2>
          <p className="text-gray-600 mb-12">
            Mulai gratis, upgrade kapan saja
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="text-center pb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Gratis</div>
                <div className="text-4xl font-bold">Rp 0</div>
                <div className="text-gray-500">selamanya</div>
              </CardHeader>
              <CardContent className="text-left">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Unlimited tags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>QR code generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Scan logging dengan lokasi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Mode Hilang dengan imbalan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Update data real-time</span>
                  </li>
                </ul>
                <Link href="/dashboard" className="block mt-6">
                  <Button className="w-full" variant="outline">
                    Mulai Gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-600 bg-blue-50/50">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Coming Soon
                </div>
                <div className="text-sm font-medium text-gray-500 mb-2">Premium</div>
                <div className="text-4xl font-bold">Rp ?</div>
                <div className="text-gray-500">per bulan</div>
              </CardHeader>
              <CardContent className="text-left">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Semua fitur Gratis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>QR Tag fisik premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Notifikasi instan WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Analytics lengkap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Multi-user account</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-bold mb-4">Siap Melindungi Barang Anda?</h2>
            <p className="text-blue-100 mb-6">
              Mulai gunakan Balikin sekarang dan berikan perlindungan ekstra untuk barang berharga Anda.
              Gratis selamanya, tanpa biaya tersembunyi.
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg">
                Buat Tag Pertama Anda
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Order CTA - WhatsApp */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="max-w-2xl mx-auto bg-green-50 border-green-200">
          <CardContent className="pt-8 pb-8 text-center">
            <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ingin QR Tag Fisik Premium?</h2>
            <p className="text-gray-600 mb-6">
              Dapatkan gantungan kunci dengan QR code berkualitas tinggi yang tahan air dan goresan.
              Hubungi kami via WhatsApp untuk pemesanan.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo%2C%20saya%20tertarik%20untuk%20 memesan%20QR%20Tag%20fisik%20Balikin', '_blank')}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Pesan via WhatsApp
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Balikin</span>
              </div>
              <p className="text-gray-600 text-sm">
                Platform Smart Lost & Found yang menghubungkan barang fisik dengan identitas digital.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#cara-kerja" className="hover:text-blue-600">Cara Kerja</Link></li>
                <li><Link href="/sign-up" className="hover:text-blue-600">Daftar Gratis</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="https://wa.me/6281234567890" className="hover:text-blue-600">Kontak</a></li>
                <li><Link href="#" className="hover:text-blue-600">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-blue-600">Kebijakan Privasi</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Balikin. Smart Lost & Found Platform.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, MessageCircle, Mail, HelpCircle, BookOpen, QrCode, Shield } from 'lucide-react';
import { MobileLayout } from '@/components/mobile/mobile-layout';

const faqItems = [
  {
    question: "Apa itu Balikin?",
    answer: "Balikin adalah platform smart lost & found Indonesia dengan QR Smart Tag. Tempel tag pada barang, jika hilang dan ditemukan orang lain, penemu scan QR untuk menghubungi Anda secara aman.",
  },
  {
    question: "Apakah nomor WhatsApp saya aman?",
    answer: "Ya, 100% aman. Nomor WhatsApp asli tidak pernah ditampilkan ke publik. Penemu hanya melihat tombol 'Hubungi Pemilik' yang dijembatani melalui server kami.",
  },
  {
    question: "Bagaimana cara aktifkan mode hilang?",
    answer: "Buka menu 'Mode Hilang' di halaman utama atau profil, lalu pilih tag yang hilang dan aktifkan status hilang. Sistem akan otomatis memberikan notifikasi saat tag di-scan.",
  },
  {
    question: "Bisakah saya ganti nomor WhatsApp tag?",
    answer: "Ya, Anda dapat mengubah nomor WhatsApp dan info kontak kapan saja melalui dashboard tanpa perlu mengganti QR fisik.",
  },
  {
    question: "Apakah penemu perlu aplikasi?",
    answer: "Tidak perlu. Sistem Balikin app-free. Penemu cukup scan QR dengan kamera bawaan HP untuk menghubungi Anda.",
  },
  {
    question: "Bagaimana cara edit pesan default penemu?",
    answer: "Buka detail tag di 'Tag Saya', lalu tap tombol 'Edit Tag'. Di sana Anda bisa mengubah kalimat default yang akan dikirimkan penemu saat menekan tombol WhatsApp.",
  },
  {
    question: "Apa itu Premium Lifetime?",
    answer: "Bayar sekali saat membeli tag fisik, fitur premium aktif selamanya selama platform beroperasi. Tidak ada biaya bulanan.",
  },
  {
    question: "Berapa lama pengiriman?",
    answer: "Jabodetabek 2–3 hari, Jawa & Bali 3–5 hari, luar pulau 7–14 hari kerja menggunakan ekspedisi terpercaya.",
  },
];

const guides = [
  { icon: QrCode, title: "Cara Kerja Tag", href: "/mobile/how-it-works", color: "from-blue-400 to-indigo-500" },
  { icon: Shield, title: "Privasi & Data", href: "/mobile/privacy-policy", color: "from-emerald-400 to-teal-500" },
  { icon: BookOpen, title: "FAQ Lengkap", href: "/mobile/faq", color: "from-purple-400 to-violet-500" },
];

export default function MobileHelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <MobileLayout activeTab="profile">
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
          <div className="px-4 py-4">
            <Link href="/mobile/profile">
              <div className="flex items-center gap-2 text-mobile-primary">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Kembali</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-mobile-primary-light via-mobile-primary to-mobile-primary-dark rounded-3xl p-6 text-white shadow-xl shadow-mobile-primary/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">FAQ & Bantuan</h1>
                <p className="text-blue-100 text-sm">Kami siap membantu Anda</p>
              </div>
            </div>
          </div>

          {/* Quick Guides */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Panduan Cepat</h2>
            <div className="grid grid-cols-3 gap-3">
              {guides.map((guide) => (
                <Link key={guide.href} href={guide.href}>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20 text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${guide.color} text-white mb-2 shadow-lg`}>
                      <guide.icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-gray-900">{guide.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Pertanyaan Umum</h2>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-gray-900 pr-4 text-sm">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">Hubungi Kami</h2>
            <div className="space-y-3">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-emerald-500 text-white rounded-2xl p-4 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Chat WhatsApp</p>
                    <p className="text-emerald-100 text-xs">Senin–Sabtu 08.00–17.00 WIB</p>
                  </div>
                </div>
              </a>
              <a
                href="mailto:support@balikin.online"
                className="block bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Email Support</p>
                    <p className="text-gray-500 text-xs">support@balikin.online</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="h-8" />
        </main>
      </div>
    </MobileLayout>
  );
}

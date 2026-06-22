import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageCircle, Mail, BookOpen, QrCode, Shield, AlertTriangle, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Bantuan & Dukungan | Balikin.online",
  description: "Pusat bantuan Balikin.online. Temukan panduan penggunaan QR Smart Tag, cara menghubungi support, dan jawaban pertanyaan umum.",
  alternates: { canonical: "/help" },
};

const guides = [
  {
    icon: QrCode,
    title: "Cara Kerja QR Smart Tag",
    description: "Pelajari cara mendaftarkan dan menggunakan tag QR Balikin untuk melindungi barang Anda.",
    href: "/how-it-works",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Shield,
    title: "Privasi & Keamanan",
    description: "Bagaimana Balikin melindungi data dan nomor WhatsApp Anda dari publik.",
    href: "/privacy-policy",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: AlertTriangle,
    title: "Mode Hilang",
    description: "Panduan mengaktifkan mode hilang dan menerima notifikasi saat barang Anda ditemukan.",
    href: "/lost-mode",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: BookOpen,
    title: "FAQ Lengkap",
    description: "Kumpulan pertanyaan yang paling sering ditanyakan seputar Balikin dan layanannya.",
    href: "/faq",
    color: "from-purple-500 to-violet-600",
  },
];

const quickTopics = [
  { question: "Apa itu Balikin?", href: "/faq#apa-itu-balikin" },
  { question: "Apakah nomor WhatsApp aman?", href: "/faq#privasi-whatsapp" },
  { question: "Cara aktifkan mode hilang", href: "/lost-mode" },
  { question: "Cara ganti nomor WhatsApp tag", href: "/dashboard" },
  { question: "Harga dan paket produk", href: "/pricing" },
  { question: "Cara klaim tag yang ditemukan", href: "/how-it-works" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pusat Bantuan</h1>
          <p className="text-xl text-blue-100">Kami siap membantu Anda 24/7</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Panduan Cepat */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Panduan Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link key={guide.href} href={guide.href}>
                <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-white/20 group cursor-pointer">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} text-white mb-4 shadow-lg`}>
                    <guide.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{guide.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Topik Populer */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pertanyaan Populer</h2>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {quickTopics.map((topic, index) => (
              <Link key={index} href={topic.href}>
                <div className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group ${
                  index < quickTopics.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                  <span className="text-gray-800 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    {topic.question}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Hubungi Support */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Hubungi Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl p-6 shadow-md transition-colors"
            >
              <MessageCircle className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Chat WhatsApp</h3>
              <p className="text-emerald-100 text-sm">Respons cepat, Senin–Sabtu 08.00–17.00 WIB</p>
            </a>
            <a
              href="mailto:support@balikin.online"
              className="block bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 shadow-md transition-colors"
            >
              <Mail className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Email Support</h3>
              <p className="text-blue-100 text-sm">support@balikin.online — balasan dalam 1×24 jam</p>
            </a>
          </div>
        </section>

        <div className="text-center text-gray-400 text-sm py-4">
          © 2026 Balikin.online · Smart Lost & Found Platform Indonesia
        </div>
      </main>
    </div>
  );
}

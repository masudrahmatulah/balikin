import type { Metadata } from "next";
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
    color: "from-brand-navy to-brand-red",
  },
  {
    icon: Shield,
    title: "Privasi & Keamanan",
    description: "Bagaimana Balikin melindungi data dan nomor WhatsApp Anda dari publik.",
    href: "/privacy-policy",
    color: "from-brand-navy-light to-brand-navy",
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
    color: "from-brand-red-light to-brand-red-dark",
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
    <div className="public-content-page min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="bg-gradient-to-r from-brand-navy to-brand-red px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Pusat Bantuan</h1>
          <p className="text-xl text-red-100">Kami siap membantu Anda menemukan jawaban</p>
          <p className="mt-4 text-sm text-red-200">Panduan penggunaan QR Smart Tag, jawaban pertanyaan umum, dan dukungan Balikin.</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <a href="/helpdesk" className="inline-flex items-center rounded-xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/15 transition-colors hover:bg-brand-red-dark">
          Buka Helpdesk AI & Konsultasi CS
        </a>
         {/* Panduan Cepat */}
        <section>
           <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Panduan Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <a key={guide.href} href={guide.href}>
                 <div className="group cursor-pointer rounded-xl border border-red-100 bg-white p-6 shadow-lg transition-shadow hover:border-red-200 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} text-white mb-4 shadow-lg`}>
                    <guide.icon className="h-6 w-6" />
                  </div>
                    <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-brand-red dark:text-white">
                    {guide.title}
                  </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{guide.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Topik Populer */}
        <section>
           <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Pertanyaan Populer</h2>
            <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-slate-900">
            {quickTopics.map((topic, index) => (
              <a key={index} href={topic.href}>
                <div className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group ${
                  index < quickTopics.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                   <span className="text-sm font-medium text-slate-800 transition-colors group-hover:text-brand-red dark:text-slate-200">
                    {topic.question}
                  </span>
                   <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-red" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Hubungi Support */}
        <section>
           <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Hubungi Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/6288783956811"
              target="_blank"
              rel="noopener noreferrer"
               className="block rounded-xl bg-emerald-500 p-6 text-white shadow-lg transition-colors hover:bg-emerald-600"
            >
              <MessageCircle className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Chat WhatsApp</h3>
              <p className="text-emerald-100 text-sm">Respons cepat, Senin–Sabtu 08.00–17.00 WIB</p>
            </a>
            <a
              href="mailto:support@balikin.online"
                className="block rounded-xl bg-gradient-to-br from-brand-navy to-brand-red p-6 text-white shadow-lg transition-colors hover:shadow-xl"
            >
              <Mail className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Email Support</h3>
               <p className="text-red-100 text-sm">support@balikin.online — balasan dalam 1×24 jam</p>
            </a>
          </div>
        </section>

        <div className="py-8 text-center text-sm text-gray-500 dark:text-slate-400">
          © 2026 Balikin.online · Smart Lost &amp; Found Platform Indonesia
        </div>
      </main>
    </div>
  );
}

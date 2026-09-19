import type { Metadata } from "next";
import { HelpCircle, MessageCircle, Mail, BookOpen, QrCode, Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";

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
    <MarketingShell
      title="Pusat Bantuan"
      description="Kami siap membantu Anda menemukan jawaban dan menggunakan Balikin dengan lebih mudah."
    >
      <section className="not-prose mx-auto max-w-3xl space-y-10">
        <div className="flex items-center gap-3 text-sm font-medium text-brand-red">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10">
            <HelpCircle className="h-5 w-5" />
          </span>
          Dukungan Balikin untuk setiap langkah
        </div>
        <a href="/helpdesk" className="inline-flex items-center rounded-xl bg-brand-red px-4 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/15 transition-colors hover:bg-brand-red-dark">
          Buka Helpdesk AI & Konsultasi CS
        </a>
        {/* Panduan Cepat */}
        <section>
           <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Panduan Utama</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <a key={guide.href} href={guide.href}>
                 <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-md transition-shadow group cursor-pointer hover:border-brand-red/30 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} text-white mb-4 shadow-lg`}>
                    <guide.icon className="h-6 w-6" />
                  </div>
                   <h3 className="font-semibold text-slate-900 mb-2 transition-colors group-hover:text-brand-red dark:text-white">
                    {guide.title}
                  </h3>
                   <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{guide.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Topik Populer */}
        <section>
           <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Pertanyaan Populer</h2>
           <div className="overflow-hidden rounded-2xl bg-white shadow-md dark:bg-slate-900">
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
           <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Hubungi Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/6288783956811"
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
               className="block rounded-2xl bg-gradient-to-br from-brand-navy to-brand-red p-6 text-white shadow-md transition-colors hover:shadow-lg"
            >
              <Mail className="h-8 w-8 mb-3" />
              <h3 className="font-bold text-lg mb-1">Email Support</h3>
               <p className="text-red-100 text-sm">support@balikin.online — balasan dalam 1×24 jam</p>
            </a>
          </div>
        </section>

      </section>
    </MarketingShell>
  );
}

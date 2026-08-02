'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, MessageCircle, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: "Apa itu Balikin?",
    answer: "Balikin adalah platform smart lost & found Indonesia dengan QR Smart Tag. Cara kerja: tempel tag pada barang, jika hilang dan ditemukan, penemu scan QR untuk menghubungi Anda secara anonim.",
  },
  {
    question: "Apakah nomor WhatsApp saya aman?",
    answer: "Ya, 100% aman. Nomor WhatsApp asli tidak pernah ditampilkan ke publik. Penemu hanya melihat tombol 'Hubungi Pemilik' yang dijembatani melalui server kami.",
  },
  {
    question: "Apa itu Premium Lifetime?",
    answer: "Bayar sekali saat beli tag fisik, fitur premium aktif selamanya selama platform beroperasi. Tidak ada biaya bulanan atau tahunan.",
  },
  {
    question: "Berapa harga QR Smart Tag?",
    answer: "Stiker Vinyl mulai Rp35.000, Gantungan Kunci Akrilik mulai Rp45.000. Semua termasuk akses premium lifetime.",
  },
  {
    question: "Apakah penemu perlu aplikasi?",
    answer: "Tidak perlu. Sistem Balikin dirancang tanpa aplikasi (app-free). Penemu cukup scan QR dengan kamera bawaan HP.",
  },
  {
    question: "Apakah stiker QR tahan air?",
    answer: "Ya, stiker menggunakan vinyl waterproof dengan laminasi pelindung, tahan air dan sinar UV.",
  },
  {
    question: "Berapa lama pengiriman?",
    answer: "Jabodetabek 2-3 hari, Jawa & Bali 3-5 hari, luar pulau 7-14 hari kerja.",
  },
  {
    question: "Bisakah ganti info kontak?",
    answer: "Ya, Anda dapat mengubah nomor WhatsApp, email, dan info lain kapan saja melalui dashboard tanpa ganti QR fisik.",
  },
];

export default function MobileFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Hero */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-mobile-primary" />
            FAQ Balikin
          </h1>
          <p className="text-sm text-gray-600">Pertanyaan yang Sering Diajukan</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-900 pr-4 text-sm">{item.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Masih Punya Pertanyaan?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tim support kami siap membantu menjawab pertanyaan Anda.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER || '6281234567890'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-mobile-success text-white py-3 rounded-xl font-semibold btn-press flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat WhatsApp
            </div>
          </a>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Camera, Globe } from 'lucide-react';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';

export default function MobileContactPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}`;

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hubungi Kami</h1>
          <p className="text-sm text-gray-600">Kami siap membantu Anda</p>
        </div>

        {/* Contact Methods */}
        <div className="space-y-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 flex items-center gap-4 btn-press">
              <div className="w-12 h-12 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">WhatsApp</h3>
                <p className="text-sm text-gray-600">Respon cepat via chat</p>
              </div>
            </div>
          </a>

          <a href="mailto:support@balikin.online" className="block">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 flex items-center gap-4 btn-press">
              <div className="w-12 h-12 bg-gradient-to-br from-mobile-info-light to-mobile-info rounded-xl flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Email</h3>
                <p className="text-sm text-gray-600">support@balikin.online</p>
              </div>
            </div>
          </a>

          <a
            href="https://balikin.online"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 flex items-center gap-4 btn-press">
              <div className="w-12 h-12 bg-gradient-to-br from-mobile-primary-light to-mobile-primary rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Website</h3>
                <p className="text-sm text-gray-600">balikin.online</p>
              </div>
            </div>
          </a>

          <a
            href="https://instagram.com/balikin.online"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 flex items-center gap-4 btn-press">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Camera</h3>
                <p className="text-sm text-gray-600">@balikin.online</p>
              </div>
            </div>
          </a>
        </div>

        {/* Office Hours */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Jam Operasional</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Senin - Jumat</span>
              <span className="font-medium">09:00 - 17:00</span>
            </div>
            <div className="flex justify-between">
              <span>Sabtu - Minggu</span>
              <span className="font-medium">10:00 - 15:00</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            WhatsApp support tersedia 24/7 untuk pertanyaan mendesak.
          </p>
        </div>

        {/* FAQ Link */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-lg border border-mobile-primary-light text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Punya Pertanyaan?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Cek FAQ kami untuk jawaban pertanyaan umum.
          </p>
          <Link href="/mobile/faq" className="block">
            <div className="bg-mobile-primary text-white py-3 rounded-xl text-center font-semibold btn-press">
              Lihat FAQ
            </div>
          </Link>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

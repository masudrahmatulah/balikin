import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Droplets, ShieldCheck, Sticker, SunMedium, MessageCircle, ArrowLeft } from 'lucide-react';
import { STICKER_PACK_PRICE, STICKER_PACK_SIZE, WHATSAPP_ORDER_NUMBER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sticker Vinyl Pack',
  description: 'Sticker Vinyl Balikin isi 6 untuk helm, laptop, koper, dan barang sehari-hari.',
};

const WHATSAPP_MESSAGE = 'Halo, saya tertarik pesan Sticker Vinyl Pack Balikin isi 6.';

const features = [
  {
    icon: BadgeCheck,
    label: 'Silver Verified Badge',
    description: 'Meningkatkan kepercayaan penemu saat melihat halaman publik sticker Anda.',
    color: 'from-gray-500 to-gray-600',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp Scan Alert',
    description: 'Begitu sticker di-scan saat mode hilang, Anda langsung dapat alert instan via WhatsApp.',
    color: 'from-mobile-success to-mobile-success',
  },
  {
    icon: Droplets,
    label: 'Waterproof',
    description: 'Material vinyl tahan air untuk pemakaian harian di helm, botol, koper, dan gadget.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: SunMedium,
    label: 'Anti-UV',
    description: 'Laminasi membantu QR tetap tajam dan tidak cepat pudar terkena matahari.',
    color: 'from-amber-500 to-amber-600',
  },
];

export default function MobileStickersPage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

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
        {/* Hero Section */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Jangan Biarkan Barang Kesayanganmu Hilang
          </h1>
          <p className="text-sm text-gray-600">
            Sticker Pintar Balikin: murah, kuat, dan menghubungkan Anda langsung dengan penemu jujur.
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-mobile-success-light to-mobile-success rounded-xl flex items-center justify-center">
              <Sticker className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sticker Vinyl Pack</h2>
              <p className="text-sm text-gray-500">Isi {STICKER_PACK_SIZE} stiker</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            Cuma <span className="font-bold text-mobile-primary">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</span> untuk satu pack isi {STICKER_PACK_SIZE} stiker.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <div key={feature.label} className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-white/20">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-2`}>
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{feature.label}</h3>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Price Card */}
        <div className="bg-gradient-to-br from-mobile-success-light to-white rounded-2xl p-5 shadow-lg border border-mobile-success-light">
          <p className="text-xs uppercase tracking-wider text-mobile-success mb-2">Starter Product</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">Rp{STICKER_PACK_PRICE.toLocaleString('id-ID')}</p>
          <p className="text-sm text-gray-600 mb-4">1 pack isi {STICKER_PACK_SIZE} stiker vinyl dengan QR unik.</p>

          <ul className="space-y-2 mb-5">
            <li className="flex items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-mobile-success flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Cocok untuk helm, laptop, koper, dan botol minum</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-mobile-success flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Aktivasi satu per satu sesuai barang</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-mobile-success flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Riwayat scan 30 hari</span>
            </li>
          </ul>

          <div className="space-y-3">
            <Link href="/mobile/stickers/checkout" className="block">
              <div className="bg-mobile-success text-white py-4 rounded-xl text-center font-semibold shadow-lg shadow-mobile-success/30 btn-press">
                Amankan Barang Saya Sekarang
              </div>
            </Link>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-white border border-gray-200 text-gray-700 py-3 rounded-xl text-center font-medium btn-press flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Tanya via WhatsApp
              </div>
            </a>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Pembayaran awal memakai QRIS manual dan diverifikasi admin.
          </p>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

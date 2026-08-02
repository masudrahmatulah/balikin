import type { Metadata } from 'next';
import Link from 'next/link';
import { Crown, Check, X, Package, Star, Zap, ArrowLeft, MessageCircle, QrCode } from 'lucide-react';
import { PREMIUM_PRICE, WHATSAPP_ORDER_NUMBER } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Upgrade Premium',
  description: 'Upgrade ke Balikin Premium untuk mendapatkan gantungan kunci QR code fisik.',
};

const freeFeatures = [
  { text: 'Maksimal 2 Tag Digital', included: true },
  { text: 'QR Code Generator', included: true },
  { text: 'Scan Logging dengan Lokasi', included: true },
  { text: 'Alert Scan via Email', included: true },
  { text: 'Mode Hilang dengan Info Imbalan', included: true },
  { text: 'Gantungan Kunci Fisik', included: false },
  { text: 'Verified Badge', included: false },
  { text: 'Notifikasi WhatsApp', included: false },
  { text: 'Unlimited Tags', included: false },
];

const premiumFeatures = [
  {
    icon: <Package className="h-5 w-5" />,
    title: 'Produk Fisik Premium',
    description: 'Gantungan kunci berkualitas tinggi.',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Verified Badge',
    description: 'Badge emas khusus.',
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Notifikasi WhatsApp',
    description: 'Alert instan saat tag di-scan.',
  },
];

export default function MobileUpgradePage() {
  const whatsappHref = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent('Halo, saya ingin upgrade tag ke Premium. Mohon infonya.')}`;

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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Crown className="h-3 w-3" />
            Premium Upgrade
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upgrade ke <span className="text-mobile-primary">Balikin Premium</span>
          </h1>
          <p className="text-sm text-gray-600">
            Dapatkan gantungan fisik premium dengan alert scan WhatsApp.
          </p>
        </div>

        {/* Free Plan */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Digital Only</h2>
            <span className="text-2xl font-bold text-gray-900">Rp 0</span>
          </div>

          <ul className="space-y-3 mb-4">
            {freeFeatures.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-mobile-success-lighter flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-mobile-success" />
                </div>
                <span className="text-sm text-gray-700">{feature.text}</span>
              </li>
            ))}
          </ul>

          <Link href="/mobile" className="block">
            <div className="bg-gray-100 text-gray-700 py-3 rounded-xl text-center font-medium">
              Pakai Gratis
            </div>
          </Link>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-mobile-primary-light to-white rounded-2xl p-5 shadow-xl border-2 border-mobile-primary relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-mobile-primary to-mobile-primary-dark text-white text-xs font-bold px-4 py-1 rounded-full">
              POPULAR
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Premium</h2>
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-mobile-primary">
              Rp {PREMIUM_PRICE.toLocaleString('id-ID')}
            </span>
          </div>

          <ul className="space-y-3 mb-4">
            {freeFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                {feature.included ? (
                  <div className="w-5 h-5 rounded-full bg-mobile-success-lighter flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-mobile-success" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <X className="h-3 w-3 text-gray-400" />
                  </div>
                )}
                <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-mobile-success text-white py-3 rounded-xl text-center font-semibold btn-press flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Pesan Sekarang
            </div>
          </a>
        </div>

        {/* Features */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Apa yang Anda Dapatkan?</h3>

          <div className="space-y-4">
            {premiumFeatures.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-mobile-primary-lighter text-mobile-primary flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Upgrade */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cara Upgrade</h3>

          <div className="space-y-3">
            {[
              { step: 1, text: 'Klik "Pesan Sekarang"' },
              { step: 2, text: 'Kirim pesan di WhatsApp' },
              { step: 3, text: 'Konfirmasi pembayaran' },
              { step: 4, text: 'Produk dikirim ke alamat' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="bg-mobile-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <p className="text-sm text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Preview */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-mobile-primary-light to-mobile-primary rounded-2xl mx-auto mb-3 flex items-center justify-center">
            <QrCode className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Produk Fisik Premium</h3>
          <p className="text-xs text-gray-600">
            Gantungan kunci akrilik 4cm x 6cm, anti air, anti pudar
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-mobile-primary to-mobile-primary-dark rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-white mb-2">
            Siap Upgrade Proteksi Barang Anda?
          </h2>
          <p className="text-blue-100 text-sm mb-4">
            Dapatkan gantungan kunci fisik premium dan semua fitur canggih Balikin.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="bg-white text-mobile-primary py-3 rounded-xl text-center font-semibold btn-press flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Pesan via WhatsApp
            </div>
          </a>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

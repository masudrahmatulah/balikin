'use client';

import { useState } from 'react';
import { AlertCircle, Copy, Check, Shield, Clock, Smartphone, QrCode, ArrowLeft, ShoppingCart } from 'lucide-react';
import { WHATSAPP_ORDER_NUMBER } from '@/lib/constants';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const mockPaymentData = {
  buyerName: 'Ahmad Rizky',
  package: 'Paket Starter - 2 Smart Tag Akrilik',
  basePrice: 35000,
  uniqueCode: 612,
  totalPrice: 35612,
  shippingAddress: 'Jl. Merdeka No. 45, Jakarta Selatan'
};

export default function MobilePaymentPage() {
  const [copied, setCopied] = useState(false);

  const { buyerName, package: packageName, basePrice, uniqueCode, totalPrice, shippingAddress } = mockPaymentData;

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalPrice.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppConfirmation = () => {
    const message = `Halo Admin Balikin, saya sudah melakukan pembayaran via QRIS.

Berikut detail pesanan saya:
- Nama: ${buyerName}
- Paket: ${packageName}
- Total Bayar: Rp ${totalPrice.toLocaleString('id-ID')}

Saya lampirkan bukti transfernya di bawah ini ya.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 text-mobile-primary">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Kembali</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Alert */}
        <div className="bg-mobile-warning-lighter border border-mobile-warning-lighter rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-mobile-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-mobile-warning">PENTING</p>
              <p className="text-xs text-mobile-warning mt-1">
                Transfer tepat sampai 3 digit terakhir ({formatCurrency(totalPrice)})
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mobile-primary" />
            Detail Pesanan
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium text-gray-900">{buyerName}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500">Paket</span>
              <span className="font-medium text-gray-900">{packageName}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500">Alamat</span>
              <span className="text-gray-700 text-right">{shippingAddress}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-dashed space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harga</span>
              <span className="text-gray-900">{formatCurrency(basePrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kode Unik</span>
              <span className="text-mobile-success font-medium">+ {uniqueCode}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="font-bold text-gray-900">Total</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-mobile-primary">
                  {formatCurrency(totalPrice)}
                </span>
                <button
                  onClick={handleCopyAmount}
                  className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-mobile-success" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QRIS Payment */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-mobile-primary" />
            Pembayaran QRIS
          </h3>

          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
            <img
              src="/images/qris-gopay.png"
              alt="QRIS GoPay"
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-900">Cara Membayar:</p>
            <ol className="space-y-2 text-xs text-gray-700">
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-mobile-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Buka GoPay/OVO/DANA/ShopeePay</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-mobile-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Pilih menu Scan QR/QRIS</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-mobile-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Scan dan masukkan nominal {formatCurrency(totalPrice)}</span>
              </li>
              <li className="flex gap-2">
                <span className="w-5 h-5 bg-mobile-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                <span>Selesaikan dan konfirmasi via WhatsApp</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
            <span className="text-xs text-gray-500">Didukung:</span>
            <div className="flex gap-1">
              {['GoPay', 'OVO', 'DANA'].map((wallet) => (
                <span key={wallet} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                  {wallet}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp CTA */}
        <button
          onClick={handleWhatsAppConfirmation}
          className="w-full bg-mobile-success text-white py-4 rounded-xl font-semibold shadow-lg shadow-mobile-success/30 btn-press flex items-center justify-center gap-2"
        >
          <Smartphone className="h-5 w-5" />
          Konfirmasi via WhatsApp
        </button>

        {/* Benefits */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Mengapa Balikin?</h3>
          <div className="space-y-3">
            {[
              { icon: Shield, title: 'Perlindungan Maksimal', desc: 'QR code untuk tracking barang hilang' },
              { icon: Clock, title: 'Respons Cepat', desc: 'Notifikasi WhatsApp instan' },
              { icon: Smartphone, title: 'Mudah Digunakan', desc: 'Cukup scan, login, dan klaim' },
            ].map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-mobile-primary-lighter text-mobile-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{benefit.title}</p>
                  <p className="text-xs text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </main>
    </div>
  );
}

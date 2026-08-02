'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertCircle, Copy, Check, Shield, Clock, Smartphone, QrCode } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock payment data (nanti diganti dari database/API)
const mockPaymentData = {
  buyerName: 'Ahmad Rizky',
  package: 'Paket Starter - 2 Smart Tag Akrilik',
  basePrice: 35000,
  uniqueCode: 612,
  totalPrice: 35612,
  whatsappNumber: '6281234567890',
  shippingAddress: 'Jl. Merdeka No. 45, Jakarta Selatan'
}

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function PaymentClient() {
  const [copied, setCopied] = useState(false)

  const { buyerName, package: packageName, basePrice, uniqueCode, totalPrice, whatsappNumber, shippingAddress } = mockPaymentData

  // Copy to clipboard function
  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalPrice.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // WhatsApp confirmation
  const handleWhatsAppConfirmation = () => {
    const message = `Halo Admin Balikin, saya sudah melakukan pembayaran via QRIS GoPay.

Berikut detail pesanan saya:
- Nama: ${buyerName}
- Paket: ${packageName}
- Total Bayar: Rp ${totalPrice.toLocaleString('id-ID')}

Saya lampirkan bukti transfernya di bawah ini ya.`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Hero Section */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            <span>Pembayaran Aman & Terpercaya</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Selesaikan Pembayaran <span className="text-emerald-600">Smart Tag QR Code Balikin</span> Anda
          </h1>
          <p className="text-gray-600 text-lg">
            Transaksi Anda aman. Lakukan pembayaran sesuai nominal yang tertera agar pesanan dapat diverifikasi dengan cepat.
          </p>
        </header>

        {/* Alert Section */}
        <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            <span className="font-bold">PENTING:</span> Mohon transfer tepat sampai 3 digit terakhir (Rp {totalPrice.toLocaleString('id-ID')}) agar pesanan Anda dapat diverifikasi dengan cepat melalui WhatsApp.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Detail Pesanan Section */}
          <section className="order-2 md:order-1">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Detail Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Nama Pembeli */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama Pembeli</p>
                    <p className="font-semibold text-gray-900">{buyerName}</p>
                  </div>
                </div>

                {/* Paket yang Dipilih */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Paket yang Dipilih</p>
                    <p className="font-semibold text-gray-900">{packageName}</p>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Alamat Pengiriman</p>
                    <p className="text-sm text-gray-700">{shippingAddress}</p>
                  </div>
                </div>

                {/* Rincian Biaya */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Harga Paket</span>
                    <span className="text-gray-900">{formatCurrency(basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kode Unik</span>
                    <span className="text-emerald-600 font-medium">+ {uniqueCode}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-dashed">
                    <span className="font-bold text-gray-900">Total Pembayaran</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        {formatCurrency(totalPrice)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-emerald-100"
                        onClick={handleCopyAmount}
                        title="Salin Nominal"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Pembayaran QRIS Section */}
          <section className="order-1 md:order-2">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Pembayaran QRIS GoPay
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* QR Code Image */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  <div className="relative bg-white p-4 rounded-lg border-2 border-gray-200 shadow-inner group-hover:border-emerald-300 transition-colors duration-300">
                    <Image
                      src="/images/qris-gopay.png"
                      alt="QRIS GoPay Balikin untuk Pembayaran Smart Tag"
                      width={400}
                      height={400}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </div>

                {/* Cara Pembayaran */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-3">Cara Membayar:</h3>
                  <ol className="space-y-3">
                    <li className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <p className="text-sm text-gray-700">Buka aplikasi GoPay, OVO, DANA, ShopeePay, atau M-Banking Anda</p>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <p className="text-sm text-gray-700">Pilih menu <strong>Scan QR</strong> atau <strong>QRIS</strong></p>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <p className="text-sm text-gray-700">Arahkan kamera ke QR Code di atas dan masukkan nominal <strong className="text-emerald-600">Rp {totalPrice.toLocaleString('id-ID')}</strong></p>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <p className="text-sm text-gray-700">Selesaikan pembayaran dan konfirmasi via WhatsApp di bawah</p>
                    </li>
                  </ol>
                </div>

                {/* E-Wallet Logos */}
                <div className="flex flex-wrap gap-2 items-center justify-center pt-2">
                  <span className="text-xs text-gray-500">Didukung oleh:</span>
                  <div className="flex gap-2">
                    {['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'].map((wallet) => (
                      <span key={wallet} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                        {wallet}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* WhatsApp CTA Button */}
        <div className="flex justify-center mb-12">
          <Button
            size="lg"
            onClick={handleWhatsAppConfirmation}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto min-w-[320px]"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Konfirmasi Pembayaran via WhatsApp
          </Button>
        </div>

        {/* Edukasi Section - SEO Rich Content */}
        <section className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl p-8 md:p-10 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
            Mengapa Menggunakan <span className="text-emerald-600">Gantungan Kunci QR Code Balikin</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Perlindungan Maksimal</h3>
              <p className="text-sm text-gray-600">Aplikasi pelacak barang hilang terintegrasi dengan teknologi QR Code yang memudahkan penemu menghubungi Anda saat barang ditemukan.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Respons Cepat</h3>
              <p className="text-sm text-gray-600">Solusi barang hilang dengan notifikasi instan via WhatsApp saat Smart Tag Anda dipindai, mempercepat proses pemulihan.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mudah Digunakan</h3>
              <p className="text-sm text-gray-600">Cara mengamankan barang berharga dengan sistem gantungan kunci QR Code yang simpel - cukup scan, login, dan klaim.</p>
            </div>
          </div>
        </section>

        {/* Additional SEO Content */}
        <section className="prose prose-gray max-w-none text-center">
          <p className="text-sm text-gray-600 leading-relaxed">
            Balikin menyediakan layanan Smart Tag QR Code premium sebagai aplikasi pelacak barang hilang terbaik di Indonesia.
            Dengan dukungan QRIS Gopay Balikin, proses pembayaran gantungan kunci QR Code menjadi mudah dan aman.
            Produk kami adalah solusi barang hilang yang efektif untuk mengamankan barang berharga seperti kunci, tas, dompet, dan peralatan elektronik.
            Pesanan Smart Tag QR Code Balikin Anda akan segera diproses setelah konfirmasi pembayaran via WhatsApp terverifikasi.
          </p>
        </section>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CheckoutPage",
            "mainEntity": {
              "@type": "Order",
              "merchant": {
                "@type": "Organization",
                "name": "Balikin",
                "url": "https://balikin.id",
                "description": "Layanan Smart Tag QR Code untuk perlindungan barang hilang"
              },
              "acceptedOffer": {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": "Smart Tag QR Code Balikin",
                  "description": "Gantungan kunci QR Code premium sebagai aplikasi pelacak barang hilang dan solusi mengamankan barang berharga.",
                  "image": "https://balikin.id/images/qris-gopay.png",
                  "category": "Security & Tracking",
                  "brand": {
                    "@type": "Brand",
                    "name": "Balikin"
                  }
                },
                "price": totalPrice,
                "priceCurrency": "IDR",
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Balikin",
                  "url": "https://balikin.id"
                }
              },
              "orderedItem": {
                "@type": "Product",
                "name": packageName,
                "description": `Pembayaran Smart Tag QR Code Balikin via QRIS GoPay untuk ${buyerName}`,
                "offers": {
                  "@type": "Offer",
                  "price": totalPrice,
                  "priceCurrency": "IDR"
                }
              },
              "orderNumber": `BALIKIN-${Date.now()}`,
              "orderStatus": "OrderPending",
              "paymentMethod": {
                "@type": "PaymentMethod",
                "name": "QRIS GoPay"
              },
              "totalPaymentDue": {
                "@type": "MonetaryAmount",
                "amount": totalPrice,
                "currency": "IDR"
              }
            },
            "description": "Halaman pembayaran Smart Tag QR Code Balikin dengan metode QRIS GoPay yang aman dan terpercaya",
            "name": "Pembayaran Smart Tag QR Code Balikin",
            "url": "https://balikin.id/payment"
          })
        }}
      />
    </div>
  )
}

// ShoppingCart icon for the card header
function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

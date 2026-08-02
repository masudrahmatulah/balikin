import { Metadata } from 'next'
import { PaymentClient } from './payment-client'

export const metadata: Metadata = {
  title: 'Pembayaran Smart Tag QR Code Balikin - QRIS GoPay Aman & Cepat',
  description: 'Selesaikan pembayaran Smart Tag QR Code Balikin Anda via QRIS GoPay. Transaksi aman, terpercaya, dan dukungan berbagai e-wallet (GoPay, OVO, DANA, ShopeePay). Solusi aplikasi pelacak barang hilang terbaik.',
  keywords: [
    'Smart Tag QR Code Balikin',
    'Aplikasi pelacak barang hilang',
    'Gantungan kunci QR Code',
    'QRIS Gopay Balikin',
    'Cara mengamankan barang berharga',
    'Solusi barang hilang',
    'Pembayaran QRIS Smart Tag',
    'Pesan Smart Tag Balikin',
    'Kunci anti hilang',
    'Pelacak QR Code Indonesia'
  ],
  openGraph: {
    title: 'Pembayaran Smart Tag QR Code Balikin - QRIS GoPay Aman & Cepat',
    description: 'Selesaikan pembayaran Smart Tag QR Code Balikin Anda via QRIS GoPay. Transaksi aman dan terpercaya.',
    url: 'https://balikin.id/payment',
    siteName: 'Balikin',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://balikin.id/images/qris-gopay.png',
        width: 1200,
        height: 630,
        alt: 'QRIS GoPay Balikin untuk Pembayaran Smart Tag'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pembayaran Smart Tag QR Code Balikin - QRIS GoPay Aman & Cepat',
    description: 'Selesaikan pembayaran Smart Tag QR Code Balikin Anda via QRIS GoPay. Transaksi aman dan terpercaya.',
    images: ['https://balikin.id/images/qris-gopay.png']
  },
  alternates: {
    canonical: 'https://balikin.id/payment'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default function PaymentPage() {
  return <PaymentClient />
}

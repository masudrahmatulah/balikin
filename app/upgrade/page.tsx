import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  ShieldCheck,
  Gift,
  QrCode,
  Check,
  X,
  MapPin,
  Bell,
  Sparkles,
  Package,
  Star,
  Zap,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

const PREMIUM_PRICE = 35000;
const WHATSAPP_NUMBER = '6281234567890';

const freeFeatures = [
  { text: 'Maksimal 2 Tag Digital', included: true },
  { text: 'QR Code Generator', included: true },
  { text: 'Scan Logging dengan Lokasi', included: true },
  { text: 'Mode Hilang dengan Info Imbalan', included: true },
  { text: 'Update Data Real-time', included: true },
  { text: 'Dashboard User-Friendly', included: true },
  { text: 'Gantungan Kunci Fisik Premium', included: false },
  { text: 'Verified Owner Badge', included: false },
  { text: 'Notifikasi WhatsApp Instan', included: false },
  { text: 'GPS Tracking Presisi', included: false },
  { text: 'Unlimited Tags', included: false },
];

const premiumFeatures = [
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Produk Fisik Premium',
    description: 'Gantungan kunci akrilik/vinyl berkualitas tinggi, anti air, anti pudar.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Verified Owner Badge',
    description: 'Badge emas khusus yang menandakan kepemilikan terverifikasi.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Notifikasi WhatsApp Instan',
    description: 'Dapatkan alert langsung via WhatsApp saat tag Anda di-scan.',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'GPS Tracking Presisi',
    description: 'Lokasi lebih akurat dengan tracking GPS (coming soon).',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Unlimited Tags',
    description: 'Buat tag sebanyak yang Anda butuhkan tanpa batas.',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Priority Support',
    description: 'Dukungan prioritas untuk semua kebutuhan Anda.',
  },
];

const physicalSpecs = [
  { label: 'Material', value: 'Akrilik 3mm / Vinyl Premium' },
  { label: 'Ukuran', value: '4cm x 6cm' },
  { label: 'Ketahanan', value: 'Anti air, Anti pudar, Anti gores' },
  { label: 'QR Code', value: 'High-quality, scannable semua kamera' },
  { label: 'Desain', value: 'Custom nama/logo (opsional)' },
];

export default function UpgradePage() {
  const handleOrderViaWhatsApp = () => {
    const message = `Halo, saya ingin upgrade tag ke Premium. Mohon infonya tentang produk fisik dan cara pembayaran.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Balikin</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
            <Crown className="mr-2 h-4 w-4" />
            Premium Upgrade
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Upgrade ke <span className="text-blue-600">Balikin Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dapatkan gantungan kunci fisik berkualitas premium dan lengkapi proteksi barang Anda.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="border-2 h-full">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Digital Only</CardTitle>
              <CardDescription>Untuk pemakaian dasar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Rp 0</span>
                <span className="text-gray-500">/selamanya</span>
              </div>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-3">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="block mt-6">
                <Button className="w-full" variant="outline" size="lg">
                  Pakai Gratis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 h-full relative shadow-xl">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                POPULAR
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                Premium
                <Crown className="h-5 w-5 text-amber-500" />
              </CardTitle>
              <CardDescription>Digital + Produk Fisik</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">Rp {PREMIUM_PRICE.toLocaleString('id-ID')}</span>
                <span className="text-gray-500">/tag</span>
              </div>
            </CardHeader>
            <CardContent className="text-left">
              <ul className="space-y-3">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {!feature.included ? (
                      <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    <span className="font-medium text-gray-700">
                      {!feature.included ? feature.text.replace('Maksimal 2', 'Unlimited') : feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={handleOrderViaWhatsApp}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Pesan Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Detail */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Apa yang Anda Dapatkan?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, i) => (
              <Card key={i} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Physical Product Specs */}
        <Card className="mb-16 bg-gradient-to-br from-gray-50 to-blue-50 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-blue-600" />
              Spesifikasi Produk Fisik
            </CardTitle>
            <CardDescription>
              Gantungan kunci premium yang dikirim ke alamat Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Fitur Produk
                </h4>
                <div className="space-y-3">
                  {physicalSpecs.map((spec, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border flex flex-col items-center justify-center text-center">
                <QrCode className="h-24 w-24 text-blue-600 mb-4" />
                <p className="text-sm text-gray-600">
                  Preview: QR code dicetak dengan kualitas tinggi pada akrilik premium
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Upgrade */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Cara Upgrade ke Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Klik tombol "Pesan Sekarang" di atas' },
                { step: 2, text: 'Anda akan diarahkan ke WhatsApp' },
                { step: 3, text: 'Kirim pesan dengan detail tag yang ingin diupgrade' },
                { step: 4, text: 'Kami akan konfirmasi harga dan metode pembayaran' },
                { step: 5, text: 'Produk fisik dikirim ke alamat Anda dalam 2-3 hari kerja' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-yellow-300" />
            <h2 className="text-2xl font-bold mb-2">
              Siap Upgrade Proteksi Barang Anda?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Dapatkan gantungan kunci fisik premium dan semua fitur canggih Balikin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-gray-100"
                onClick={handleOrderViaWhatsApp}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Pesan via WhatsApp
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Kembali ke Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

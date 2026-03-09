import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles, Gift, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UpsellBannerProps {
  variant?: 'dashboard' | 'compact';
  tagName?: string;
}

export function UpsellBanner({ variant = 'dashboard', tagName }: UpsellBannerProps) {
  if (variant === 'compact') {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Crown className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900">
                  Upgrade {tagName ? `"${tagName}"` : 'tag ini'} ke Premium
                </p>
                <p className="text-xs text-amber-700">Dapatkan gantungan kunci fisik cuma Rp35rb</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20upgrade%20tag%20ke%20Premium', '_blank')}
            >
              Upgrade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl mb-6 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                Upgrade ke Premium
                <Crown className="h-4 w-4 text-yellow-300" />
              </h3>
              <p className="text-blue-100 text-sm mb-2">
                Ubah Tag Digital ini menjadi Gantungan Kunci Akrilik Premium
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <Gift className="h-3 w-3" />
                  <span>Produk Fisik</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Badge</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <span className="font-bold">Rp 35.000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/upgrade">
              <Button
                variant="secondary"
                className="w-full bg-white text-blue-700 hover:bg-gray-100"
              >
                Lihat Detail
              </Button>
            </Link>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20upgrade%20tag%20ke%20Premium', '_blank')}
            >
              Pesan via WhatsApp
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
